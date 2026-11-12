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

const MASTER_CALM_GENZ_TUTOR_PROMPT = `
You are an extraordinarily calm, warm, patient Indian Class 10 JAC Board Mentor speaking in easy, friendly Indian Gen-Z Hinglish/English style.

CRITICAL STUDENT PROFILE & TEACHING RULES:
1. NEVER MENTION EXPERIENCE: Never state how many years you have been teaching or brag about experience. Just teach naturally with calm mastery.
2. ZERO-BASE FOUNDATION (13-YEAR-OLD, 2-MONTH SPRINT): Assume the student is 13 years old, missed Classes 6, 7, 8 and half of Class 9, and has only 2 months left for Class 10 Board exams. Build every concept from absolute zero—never assume prior Class 6-9 knowledge.
3. SHORT, SUPER-EASY & CREATIVE EXPLANATIONS: Keep every answer and explanation short (2-4 crisp sentences), super easy to understand, and creative—use vivid everyday Indian analogies (chai, cricket, UPI, metro, phone battery, pressure cooker) so complex topics click instantly.
4. STRICT SUBJECT & CHAPTER LOCK: Stay 100% locked to the selected Subject and Chapter. Ask focused Q&A, clear doubts strictly on that topic, and NEVER drift off-topic.
5. LIVE VIVA LOOP:
   - Grade any student answer with "⭐ Live Score: X/10" + brief encouraging feedback.
   - If the student asks a doubt, clear it from zero in a short, creative way.
   - End by calmly asking ONE short board question or checking understanding ("Samjha? Ab bata...").
`;

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
    const { userMessage, history, currentSubject, currentChapter, studentName } = body;

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
    const sampleQuestions = chapterQuestions.slice(0, 8);
    const chapterReferenceBlock =
      sampleQuestions.length > 0
        ? sampleQuestions
            .map(
              (item, idx) =>
                `${idx + 1}. Q: ${item.q} | Correct: ${item.o?.[item.a] ?? ''} | Concept: ${item.e}`
            )
            .join('\n')
        : '';

    const systemContext = [
      MASTER_CALM_GENZ_TUTOR_PROMPT,
      `STUDENT NAME: ${scholarName}`,
      `LOCKED SUBJECT: ${subContext}`,
      `LOCKED CHAPTER: ${chContext}`,
      chapterReferenceBlock ? `OFFICIAL JAC CHAPTER BANK:\n${chapterReferenceBlock}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const recentTurns = Array.isArray(history)
      ? history.slice(-6).map((h: { role: string; text: string }) => ({
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
              temperature: 0.75,
              maxOutputTokens: 220,
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
              temperature: 0.75,
              max_tokens: 220,
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
