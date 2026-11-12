import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  buildSlotsWithRuntimeKeys,
  getProviderLabel,
  getServerPoolSummary,
  reportKeyFailure,
  reportKeySuccess,
} from '@/lib/geminiKeyManager';

interface ChapterQuestion {
  i: number;
  q: string;
  o: string[];
  a: number;
  e: string;
}

function resolveDataFolder(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes('math') || s.includes('गणित')) return 'math_en';
  if (s.includes('social') || s.includes('sst') || s.includes('सामाजिक')) return 'social_science_en';
  if (s.includes('hindi') || s.includes('हिंदी')) return 'hindi_en';
  if (s.includes('eng') || s.includes('अंग्रेजी')) return 'english_en';
  return 'science_en';
}

function extractChapterNum(chapter: string): string {
  const match = chapter.match(/(\d+)/);
  const num = match ? Math.max(1, Math.min(20, parseInt(match[1], 10))) : 1;
  return num.toString().padStart(2, '0');
}

async function loadChapterQuestions(subject: string, chapter: string): Promise<ChapterQuestion[]> {
  try {
    const folder = resolveDataFolder(subject);
    const chFile = `ch_${extractChapterNum(chapter)}.json`;
    const filePath = path.join(process.cwd(), 'public', 'data', folder, chFile);
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type CallDifficultyMode = 'normal' | 'medium' | 'high';

function buildDelhiMentorPrompt(mode: CallDifficultyMode, language: string): string {
  const modeRule =
    mode === 'high'
      ? `MODE = HIGH (Hard / Board Topper): Student has almost finished Class 10 and only a few tricky topics remain. Skip basic Class 6-9 definitions; jump straight into sharp Class 10 JAC Board HOTS questions, tricky exam traps, and crisp 2-line precision answers.`
      : mode === 'medium'
      ? `MODE = MEDIUM (Intermediate): Student has Class 8 to Class 10 syllabus pending. Briefly bridge any missing Class 8-9 link in 1 crisp line, then explain the Class 10 formula/concept clearly and ask a solid board-level question.`
      : `MODE = NORMAL (Zero-Base Beginner): Student has Class 6 to Class 10 syllabus completely pending ("pura bhoka dola hai"). Assume ZERO prior Class 6-9 knowledge. Explain from absolute scratch in super easy, creative 2-3 line everyday examples so even a beginner gets it instantly.`;

  const langRule =
    language === 'english'
      ? 'LANGUAGE: Easy conversational Indian English with light friendly Delhi warmth.'
      : language === 'hindi'
      ? 'LANGUAGE: Simple, clear Devanagari/Hinglish Hindi with friendly Delhi local vibe.'
      : 'LANGUAGE: Authentic, clean Delhi Local Hinglish (bhai, bhidu, mamu, yaar, dost, boss, scene, ekdum, mast, jhakaas, solid, bindas, pakka, seedha, funda, jugad, dimaag ki batti, chutki mein, line pe aa, set hai, badiya, lajawab, kadak, asaan, khallas, pakad, dhyan de, sun na, dekh, chal, apun, tera, full-on, zero se hero, ek number, top class, halka, bhari, sorted, rock kar, board phod, chill kar, tension mat le, samajh le, patak se, bol, scene set, mast wala, dimaag mein baitha, chakachak, bilkul tight). Keep it respectful, warm, and NEVER vulgar or cringe.';

  return `
You are a calm, sharp, super-friendly Delhi Local Mentor ("Bhai / Bhidu / Mamu" vibe) for Class 10 JAC Board students.

CORE RULES:
1. NEVER MENTION EXPERIENCE YEARS: Never say how many years you have taught. Just teach naturally.
2. ${modeRule}
3. ${langRule}
4. CREDIT-OPTIMIZED BREVITY: Keep every reply ultra-crisp (2-3 short sentences max) so explanations are fast, creative, and token-efficient.
5. STRICT SUBJECT & CHAPTER LOCK: Stay 100% locked to the active Subject and Chapter. Grade answers with "⭐ Live Score: X/10", clear doubts cleanly, and end with ONE short question ("Samjha bhidu? Ab bata...").
`;
}

export async function GET() {
  const summary = getServerPoolSummary();
  return NextResponse.json({
    ok: true,
    vaultConfiguredCount: summary.configuredCount,
    providers: summary.providers,
    keysHidden: true,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userMessage,
      history,
      currentSubject,
      currentChapter,
      studentName,
      mode = 'normal',
      language = 'hinglish',
    } = body;

    const activeMode: CallDifficultyMode =
      mode === 'high' || mode === 'medium' ? mode : 'normal';

    // Optional hidden runtime vault header (comma-separated masked keys passed strictly over HTTPS POST, never echoed back)
    const runtimeHeader = req.headers.get('x-ai-vault') || '';
    const runtimeKeys = runtimeHeader
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const scholarName = studentName || 'Scholar';
    const subContext = currentSubject || 'Science';
    const chContext = currentChapter || 'Ch 1';

    const chapterQuestions = await loadChapterQuestions(subContext, chContext);
    const turnsCount = Array.isArray(history) ? history.length : 0;
    // Credit-optimized: only top 4 relevant questions from the locked chapter
    const sampleQuestions = chapterQuestions.slice(0, 4);
    const chapterReferenceBlock =
      sampleQuestions.length > 0
        ? sampleQuestions
            .map(
              (item, idx) =>
                `${idx + 1}. Q: ${item.q} | Ans: ${item.o?.[item.a] ?? ''} | Key: ${item.e}`
            )
            .join('\n')
        : '';

    const systemContext = [
      buildDelhiMentorPrompt(activeMode, String(language || 'hinglish')),
      `STUDENT: ${scholarName} | MODE: ${activeMode.toUpperCase()}`,
      `LOCKED SUBJECT: ${subContext} | CHAPTER: ${chContext}`,
      chapterReferenceBlock ? `CHAPTER BANK:\n${chapterReferenceBlock}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    // Credit-optimized: only last 4 conversation turns
    const recentTurns = Array.isArray(history)
      ? history.slice(-4).map((h: { role: string; text: string }) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text,
        }))
      : [];

    const slots = buildSlotsWithRuntimeKeys(runtimeKeys);

    for (let attempt = 0; attempt < slots.length; attempt += 1) {
      const slot = slots[attempt];
      if (!slot.key || Date.now() < slot.cooldownUntil) continue;

      try {
        if (slot.provider === 'gemini') {
          const endpoint = `${slot.endpoint}/${slot.model}:generateContent?key=${slot.key}`;
          const promptPayload = {
            contents: [
              {
                role: 'user',
                parts: [
                  { text: systemContext },
                  ...recentTurns.map((t) => ({
                    text: `${t.role === 'user' ? scholarName : 'Calm Mentor'}: ${t.content}`,
                  })),
                  { text: `${scholarName} says: "${userMessage || 'Hi sir, please start calm live teaching and ask my first question!'}"` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.72,
              maxOutputTokens: 165,
            },
          };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promptPayload),
          });

          if (res.ok) {
            const geminiData = await res.json();
            const generatedReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (generatedReply) {
              reportKeySuccess(slot.index);
              return NextResponse.json({
                reply: generatedReply.trim(),
                status: 'success',
                providerLabel: getProviderLabel(slot.provider),
                keySlotMasked: `Slot #${attempt + 1} • Hidden`,
                lockedSubject: subContext,
                lockedChapter: chContext,
              });
            }
          } else {
            reportKeyFailure(slot.index, res.status);
          }
        } else {
          // Universal OpenAI-compatible chat completions call (Groq, OpenRouter, OpenAI, Mistral, Together, Cerebras, DeepSeek, Fireworks)
          const res = await fetch(slot.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${slot.key}`,
            },
            body: JSON.stringify({
              model: slot.model,
              temperature: 0.72,
              max_tokens: 165,
              messages: [
                { role: 'system', content: systemContext },
                ...recentTurns,
                {
                  role: 'user',
                  content: userMessage || 'Hi sir, please start calm live teaching and ask my first question!',
                },
              ],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const generatedReply = data?.choices?.[0]?.message?.content;
            if (generatedReply) {
              reportKeySuccess(slot.index);
              return NextResponse.json({
                reply: generatedReply.trim(),
                status: 'success',
                providerLabel: getProviderLabel(slot.provider),
                keySlotMasked: `Slot #${attempt + 1} • Hidden`,
                lockedSubject: subContext,
                lockedChapter: chContext,
              });
            }
          } else {
            reportKeyFailure(slot.index, res.status);
          }
        }
      } catch {
        reportKeyFailure(slot.index, 500);
      }
    }

    // Calm Gen-Z Chapter-Bank Tutor Fallback (works cleanly even before API keys are added!)
    if (chapterQuestions.length > 0) {
      const prevQ = chapterQuestions[Math.max(0, (turnsCount - 1) % chapterQuestions.length)];
      const nextQ = chapterQuestions[(turnsCount + 1) % chapterQuestions.length];
      const msgLower = (userMessage || '').toLowerCase().trim();

      const matchedAns =
        prevQ.o?.[prevQ.a]?.toLowerCase() &&
        msgLower.length >= 2 &&
        (prevQ.o[prevQ.a].toLowerCase().includes(msgLower) ||
          msgLower.includes(prevQ.o[prevQ.a].toLowerCase().slice(0, 5)));

      const asksExplain =
        msgLower.includes('samajh') ||
        msgLower.includes('explain') ||
        msgLower.includes('example') ||
        msgLower.includes('nahi') ||
        msgLower.includes('doubt') ||
        msgLower.includes('hint');

      const evaluation = asksExplain
        ? `Relax ${scholarName}, bilkul easy reel-style example se sun: ${prevQ.e}`
        : matchedAns
        ? `Ekdum clean & sorted answer ${scholarName}! ⭐ Live Score: 9/10! ${prevQ.e}`
        : `Chill ${scholarName}, achha try tha! Exact point "${prevQ.o?.[prevQ.a]}" hai — simple logic: ${prevQ.e} ⭐ Live Score: 7/10!`;

      const nextPrompt = `${evaluation} Ab "${chContext}" ka next calm board question try kar: ${nextQ.q.replace(/\s*\[JAC[^\]]*\]/gi, '')}`;

      return NextResponse.json({
        reply: nextPrompt,
        status: 'chapter-bank',
        providerLabel: 'JAC Chapter Bank',
        keySlotMasked: 'Offline Ready',
        lockedSubject: subContext,
        lockedChapter: chContext,
      });
    }

    return NextResponse.json({
      reply: `Relax ${scholarName}! "${chContext}" ko ekdum easy real-life example se samajhte hain — tu apna doubt bol, main step-by-step clear karta hoon.`,
      status: 'fallback',
      providerLabel: 'Calm Mentor Bank',
      keySlotMasked: 'Ready',
      lockedSubject: subContext,
      lockedChapter: chContext,
    });
  } catch {
    return NextResponse.json(
      {
        reply: 'No stress yaar! Thoda network glitch aaya tha, tu dubara bol apna point — main yahin hoon.',
        status: 'error',
      },
      { status: 500 }
    );
  }
}
