import { NextRequest, NextResponse } from 'next/server';
import {
  buildSlotsWithRuntimeKeys,
  getProviderLabel,
  getServerPoolSummary,
  reportKeyFailure,
  reportKeySuccess,
} from '@/lib/geminiKeyManager';

export async function GET() {
  const summary = getServerPoolSummary();
  return NextResponse.json({
    status: 'online',
    providers: summary,
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      history = [],
      presetCode,
      level = 'normal',
      tone = 'hinglish',
      subject,
      chapter,
      imageDataUrl
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const slots = buildSlotsWithRuntimeKeys();
    if (!slots || slots.length === 0) {
      return NextResponse.json(
        { error: 'No active AI providers available in vault. Check server configuration.' },
        { status: 503 }
      );
    }

    const toneInstruction =
      tone === 'delhi'
        ? 'Speak like an energetic, smart Delhi study buddy (casual, brotherly Hinglish, clear, confident).'
        : tone === 'bihar'
        ? 'Speak like a respectful, focused Bihar study scholar (diligent, polite, grounded exam-oriented).'
        : tone === 'hindi'
        ? 'Speak in pure, authentic Hindi medium academic language (शुद्ध हिंदी).'
        : tone === 'english'
        ? 'Speak in clear, structured academic English.'
        : 'Speak in a friendly, engaging local Hindi + English (Hinglish) mix like a helpful study companion.';

    const depthInstruction =
      level === 'easy'
        ? 'DEPTH: EASY. Keep it short, use everyday simple words, 1 familiar analogy, zero confusing jargon.'
        : level === 'medium'
        ? 'DEPTH: MEDIUM. Include step-by-step points, important formulas, and practical examples.'
        : level === 'high'
        ? 'DEPTH: HIGH. Thorough breakdown, edge cases, formulas, and structured reasoning.'
        : level === 'extreme'
        ? 'DEPTH: EXTREME. Maximum useful depth, complete comprehensive coverage, tables, and nuances.'
        : 'DEPTH: NORMAL. School exam-level, key definitions, 1 solid example, clear bullet points.';

    const systemContext = `You are "Study Buddy AI Master" for Class 10 JAC Board scholars.
Tone & Style: ${toneInstruction}
Explanation Depth: ${depthInstruction}
${subject ? `Subject: ${subject}` : ''}
${chapter ? `Chapter: ${chapter}` : ''}
${presetCode ? `Active Secret Preset: ${presetCode}` : ''}

RULES:
1. Answer the user's specific question directly. Explain at the requested depth.
2. Do not invent an unsolicited quiz unless the user explicitly selected Exam Simulator / Socratic mode.
3. Keep scientific & mathematical terms in standard English/Hindi as used in JAC exams.
4. Format output using clean Markdown, bold headings, bullet points, and code/math blocks.`;

    const recentTurns = Array.isArray(history)
      ? history.slice(-6).map((h: { role: string; text: string }) => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text,
        }))
      : [];

    for (let attempt = 0; attempt < slots.length; attempt += 1) {
      const slot = slots[attempt];
      if (!slot.key || Date.now() < slot.cooldownUntil) continue;

      try {
        if (slot.provider === 'gemini') {
          const endpoint = `${slot.endpoint}/${slot.model}:generateContent?key=${slot.key}`;
          const parts: any[] = [{ text: systemContext }];

          if (imageDataUrl && typeof imageDataUrl === 'string' && imageDataUrl.includes(',')) {
            const [meta, base64Data] = imageDataUrl.split(',');
            const mimeType = meta.split(';')[0].replace('data:', '') || 'image/jpeg';
            parts.push({
              inlineData: {
                mimeType,
                data: base64Data
              }
            });
          }

          for (const t of recentTurns) {
            parts.push({ text: `${t.role === 'user' ? 'Student' : 'AI Companion'}: ${t.content}` });
          }
          parts.push({ text: `Student asks: "${prompt}"` });

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1200,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) {
              reportKeySuccess(slot.index);
              return NextResponse.json({
                ok: true,
                reply: reply.trim(),
                provider: slot.provider,
                providerLabel: getProviderLabel(slot.provider),
                model: slot.model,
                level,
                tone
              });
            }
          } else {
            reportKeyFailure(slot.index, res.status);
          }
        } else {
          // Universal OpenAI-compatible call (Groq, Mistral, OpenRouter, Cohere, Zhipu, Kilo, LLM7)
          const messages: any[] = [
            { role: 'system', content: systemContext },
            ...recentTurns,
            { role: 'user', content: prompt }
          ];

          const res = await fetch(slot.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${slot.key}`,
            },
            body: JSON.stringify({
              model: slot.model,
              temperature: 0.7,
              max_tokens: 1200,
              messages,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (reply) {
              reportKeySuccess(slot.index);
              return NextResponse.json({
                ok: true,
                reply: reply.trim(),
                provider: slot.provider,
                providerLabel: getProviderLabel(slot.provider),
                model: slot.model,
                level,
                tone
              });
            }
          } else {
            reportKeyFailure(slot.index, res.status);
          }
        }
      } catch (slotErr) {
        reportKeyFailure(slot.index, 500);
      }
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'All multi-provider AI slots in the vault are momentarily resting. Please retry in a few seconds.'
      },
      { status: 502 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
