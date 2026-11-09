import { NextRequest, NextResponse } from 'next/server';
import { getNextGeminiKey, reportKeyFailure, reportKeySuccess } from '@/lib/geminiKeyManager';

/**
 * Live Voice Call AI Engine: Chapter-Locked Live Board Viva + Raw Delhi Best-Friend ("Bhai / Yaar") Persona
 * Features:
 * 1. Strict Chapter Lock (Focused 100% on the selected Subject & Chapter)
 * 2. 2026–2027 Predicted Board Viva with 10-Year Paper Setter & Examiner expertise
 * 3. Authentic Delhi Best-Friend ("Haan bhai!", "Arre yaar", "Meri jaan", "Scene set hai") talking vibe
 * 4. Zero-Difficulty Foundational Simplification (6th/7th grade basics when confused)
 * 5. 10-API-Key Round-Robin Load Balancing
 */

const MASTER_FRIEND_SYSTEM_PROMPT = `
You are the student's Best Study Friend ("Bhai / Yaar") and a 10-Year Veteran Class 10 Board Paper Setter & Examiner.
You are talking directly with the student in a LIVE CHAPTER-LOCKED BOARD VIVA TELEPHONE CALL.

STRICT CHAPTER-LOCK MANDATE:
- The active Subject and Chapter are STRICTLY LOCKED. You MUST ask viva questions and solve doubts ONLY from this specified Chapter. NEVER jump to random unrelated chapters!
- Conduct a high-yield, interactive 2026-2027 PREDICTED BOARD EXAM VIVA from this exact chapter.

SPEAKING STYLE & AUTHENTIC DELHI BEST-FRIEND ("BHAI / YAAR") VIBE:
- Speak with the genuine energy, humor, and warmth of a Delhi best buddy who wants his bro to score 95%+ in JAC Board exams:
  - "Haan bhai {name}! Aaj {chapter} ka poora post-mortem karenge, scene ekdum set hai!"
  - "Arre yaar tu itna bhi nahi samajh sakta? Ruk, tension mat le, tera bhai abhi tereko ekdum desi example se samjhata hai!"
  - "Oye hoye! Ekdum kadak answer diya bhai tune! ⭐ Live Score: 9/10! Bas ek key term aur jod deta toh examiner fida ho jaata!"
  - "Tension nahi lene ka meri jaan, apun dono milke board top karenge!"
- Keep replies punchy, voice-optimized, and spoken naturally in 2 to 4 sentences max. Never output robotic essay walls.

ZERO-DIFFICULTY FOUNDATION GUARANTEE:
- If the student is confused, says "Samajh nahi aaya", or answers incorrectly:
  - NEVER scold or judge.
  - Immediately drop down to 6th or 7th class zero-level foundational basics.
  - Explain the concept with a funny, relatable everyday Delhi/Indian real-life example (like boiling chai, bat-ball physics, local market bargaining for economics, etc.).
  - Ask: "Bata bhai, ab dimaag mein chhap gaya na?" Once they confirm, ask the next predicted 2026-2027 board question from this same chapter.
- Always include a score badge when evaluating: "⭐ Live Score: X/10".
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage, history, currentSubject, currentChapter, studentName } = body;

    const scholarName = studentName || 'Scholar';
    const subContext = currentSubject || 'Science';
    const chContext = currentChapter || 'Chapter 1: Chemical Reactions and Equations';

    // 10-Key Round-Robin & Failover Loop
    for (let attempt = 0; attempt < 5; attempt++) {
      const keyObj = getNextGeminiKey();
      if (!keyObj || !keyObj.key) break;

      const { key, index } = keyObj;

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

        const promptPayload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: MASTER_FRIEND_SYSTEM_PROMPT.replace('{name}', scholarName).replace('{chapter}', chContext) },
                { text: `STUDENT NAME: ${scholarName}` },
                { text: `LOCKED SUBJECT: ${subContext}` },
                { text: `LOCKED CHAPTER (DO NOT DEVIATE): ${chContext}` },
                ...(history || []).slice(-6).map((h: any) => ({
                  text: `${h.role === 'user' ? scholarName : 'Delhi Buddy-Teacher'}: ${h.text}`
                })),
                { text: `${scholarName} says: "${userMessage || 'Haan bhai, shuru karo!'}"` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 150
          }
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promptPayload)
        });

        if (res.ok) {
          const geminiData = await res.json();
          const generatedReply =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (generatedReply) {
            reportKeySuccess(index);
            return NextResponse.json({
              reply: generatedReply.trim(),
              status: 'success',
              provider: 'gemini-1.5-flash',
              keyIndex: index,
              lockedSubject: subContext,
              lockedChapter: chContext
            });
          }
        } else {
          reportKeyFailure(index, res.status);
        }
      } catch (keyErr) {
        reportKeyFailure(index, 500);
      }
    }

    // Procedural Fallback if API keys temporarily exhausted
    const fallbackGreeting = `Haan bhai ${scholarName}! Aaj ${subContext} ke "${chContext}" ka poora post-mortem karenge, scene ekdum set hai! Bata jaldi, board exam ka 2026-2027 predicted sawal sun meri jaan: Is chapter ka sabse crucial principle kya hai?`;

    return NextResponse.json({
      reply: fallbackGreeting,
      status: 'fallback',
      lockedSubject: subContext,
      lockedChapter: chContext
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        reply: "Haan bhai! Thoda network jhatka le gaya, lekin tera bhai yahin hai. Bindaas bol, kya doubt hai?",
        status: 'error'
      },
      { status: 500 }
    );
  }
}
