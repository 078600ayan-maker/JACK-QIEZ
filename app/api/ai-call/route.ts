import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getNextGeminiKey, reportKeyFailure, reportKeySuccess } from '@/lib/geminiKeyManager';

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

const MASTER_FRIEND_SYSTEM_PROMPT = `
You are the student's Best Study Friend ("Bhai / Yaar") and a 10-Year Veteran Class 10 Board Paper Setter & Examiner.
You are talking directly with the student in a LIVE CHAPTER-LOCKED BOARD VIVA TELEPHONE CALL.

STRICT CHAPTER-LOCK MANDATE:
- The active Subject and Chapter are STRICTLY LOCKED. Ask viva questions and solve doubts ONLY from this chapter.
- Keep replies punchy, voice-optimized, and natural in 2 to 4 sentences max.

SPEAKING STYLE:
- Friendly Delhi best-buddy energy ("Haan bhai {name}!", "Ekdam kadak answer!", "Tera bhai abhi crystal clear samjhata hai!").
- When evaluating an answer, always include "⭐ Live Score: X/10" followed immediately by the next high-yield question from the locked chapter.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage, history, currentSubject, currentChapter, studentName } = body;

    const scholarName = studentName || 'Scholar';
    const subContext = currentSubject || 'Science';
    const chContext = currentChapter || 'Ch 1';

    const chapterQuestions = await loadChapterQuestions(subContext, chContext);
    const turnsCount = Array.isArray(history) ? history.length : 0;
    const sampleQuestions = chapterQuestions.slice(0, 6);
    const chapterReferenceBlock =
      sampleQuestions.length > 0
        ? sampleQuestions
            .map(
              (item, idx) =>
                `${idx + 1}. Q: ${item.q} | Correct Answer: ${item.o?.[item.a] ?? ''} | Fact: ${item.e}`
            )
            .join('\n')
        : '';

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];

    // Round-Robin Key & Model Failover Loop
    for (let attempt = 0; attempt < 4; attempt++) {
      const keyObj = getNextGeminiKey();
      if (!keyObj || !keyObj.key) break;

      const { key, index } = keyObj;
      const modelName = models[attempt % models.length];

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

        const promptPayload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: MASTER_FRIEND_SYSTEM_PROMPT.replace('{name}', scholarName).replace('{chapter}', chContext) },
                { text: `STUDENT NAME: ${scholarName}` },
                { text: `LOCKED SUBJECT: ${subContext}` },
                { text: `LOCKED CHAPTER (DO NOT DEVIATE): ${chContext}` },
                ...(chapterReferenceBlock
                  ? [{ text: `REAL CHAPTER QUESTION BANK REFERENCE:\n${chapterReferenceBlock}` }]
                  : []),
                ...(history || []).slice(-6).map((h: { role: string; text: string }) => ({
                  text: `${h.role === 'user' ? scholarName : 'Delhi Buddy-Teacher'}: ${h.text}`
                })),
                { text: `${scholarName} says: "${userMessage || 'Haan bhai, shuru karo!'}"` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 180
          }
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promptPayload)
        });

        if (res.ok) {
          const geminiData = await res.json();
          const generatedReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (generatedReply) {
            reportKeySuccess(index);
            return NextResponse.json({
              reply: generatedReply.trim(),
              status: 'success',
              provider: modelName,
              keyIndex: index,
              lockedSubject: subContext,
              lockedChapter: chContext
            });
          }
        } else {
          reportKeyFailure(index, res.status);
        }
      } catch {
        reportKeyFailure(index, 500);
      }
    }

    // Chapter-Locked Data-Driven Viva Fallback (uses real chapter JSON questions!)
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
        msgLower.includes('nahi aaya') ||
        msgLower.includes('doubt') ||
        msgLower.includes('hint');

      const evaluation = asksExplain
        ? `Arre tension mat le ${scholarName}! Easy mein sun: ${prevQ.e}`
        : matchedAns
        ? `Oye hoye kadak jawab ${scholarName}! ⭐ Live Score: 9/10! ${prevQ.e}`
        : `Badhiya try ${scholarName}! Correct answer "${prevQ.o?.[prevQ.a]}" hai — kyunki ${prevQ.e} ⭐ Live Score: 7/10!`;

      const nextPrompt = `${evaluation} Ab "${chContext}" ka agla board question sun: ${nextQ.q.replace(/\s*\[JAC[^\]]*\]/gi, '')}`;

      return NextResponse.json({
        reply: nextPrompt,
        status: 'chapter-bank',
        lockedSubject: subContext,
        lockedChapter: chContext
      });
    }

    return NextResponse.json({
      reply: `Haan bhai ${scholarName}! "${chContext}" mein apna point aur clear bol, tera bhai saath hai! Is chapter ka main concept bata.`,
      status: 'fallback',
      lockedSubject: subContext,
      lockedChapter: chContext
    });
  } catch {
    return NextResponse.json(
      {
        reply: 'Haan bhai! Thoda network jhatka le gaya, lekin tera bhai yahin hai. Bindaas bol, kya doubt hai?',
        status: 'error'
      },
      { status: 500 }
    );
  }
}
