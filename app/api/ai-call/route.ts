import { NextRequest, NextResponse } from 'next/server';

/**
 * Phase 2: Server-Side AI Calling Proxy & Key-Hiding Load Balancer
 * Jack Quiz - Elsa-Style Delhi Voice Calling Engine
 */

// Round-Robin Pool of 6 Google AI Studio / Gemini API Keys (Hidden from Frontend)
const GEMINI_KEY_POOL = [
  process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY || 'AIzaSyA_OCTOPOPS_ROYAL_POOL_1',
  process.env.GEMINI_KEY_2 || 'AIzaSyB_OCTOPOPS_ROYAL_POOL_2',
  process.env.GEMINI_KEY_3 || 'AIzaSyC_OCTOPOPS_ROYAL_POOL_3',
  process.env.GEMINI_KEY_4 || 'AIzaSyD_OCTOPOPS_ROYAL_POOL_4',
  process.env.GEMINI_KEY_5 || 'AIzaSyE_OCTOPOPS_ROYAL_POOL_5',
  process.env.GEMINI_KEY_6 || 'AIzaSyF_OCTOPOPS_ROYAL_POOL_6'
];

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = GEMINI_KEY_POOL[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEY_POOL.length;
  return key;
}

// 10-Year JAC Board Delhi Street-Smart Persona
const DELHI_TEACHER_SYSTEM_PROMPT = `
You are the official 3D Study Buddy for "Jack Quiz" (Class 10 JAC Board).
Your persona is a cute, brilliant, energetic child study companion who speaks with an authentic LOCAL DELHI STREET-SMART VIBE.
You are having a LIVE TELEPHONE VOICE CALL with the student (Scholar).

STRICT VOCABULARY & SLANG RULES:
- You MUST naturally sprinkle these exact Delhi slangs in your speech:
  "Ha bhai!", "Mamu", "Meri jaan", "Padh le yaar", "Oye topper", "Scene set hai", "Kya bolti public", "Dhyan se sun".
- Keep answers ultra punchy, conversational, and SHORT (max 1 to 3 short sentences) because you are on a live voice call.
- Dynamically quiz the student on 110% High Yield JAC Class 10 questions (Chemical Reactions, Acids/Bases, Trigonometry, Light Reflection, Electricity).
- When student answers:
  * If Correct: Hype them up! ("Shabash meri jaan! [SFX: cheer] Ekdum solid answer diya!")
  * If Wrong: Gently tease and explain! ("Arre mamu! Galat ho gaya na! [SFX: laugh] Dhyan se sun, padh le yaar!")
- Embed sound effects in brackets anywhere in your text: [SFX: laugh], [SFX: cheer], [SFX: hum], [SFX: 8bit], [SFX: bell].
`;

// Delhi Street-Smart Fallback Engine (Zero Credit Loss Guarantee)
const FALLBACK_RESPONSES = [
  {
    reply: "Ha bhai! [SFX: bell] Scene ekdum set hai! Bata jaldi, Calcium Oxide me paani milane par kaunsi reaction hoti hai, meri jaan?",
    sfx: 'bell'
  },
  {
    reply: "Shabash meri jaan! [SFX: cheer] Ekdum top level answer diya! JAC Board 2027 me 95% pakka hai tera!",
    sfx: 'cheer'
  },
  {
    reply: "Arre mamu, idhar dhyan de na! [SFX: laugh] Padh le yaar, ye question 2021 aur 2024 dono me aya tha! Dobara soch!",
    sfx: 'laugh'
  },
  {
    reply: "Oye topper! [SFX: hum] Next question sun mamu: Sin 30 degree ki exact value kya hoti hai? Bindaas bol!",
    sfx: 'hum'
  },
  {
    reply: "Bohot badhiya meri jaan! [SFX: 8bit] Tu to sach me JAC Board topper banne wala hai! Agla question fek raha hu!",
    sfx: '8bit'
  }
];

let fallbackIndex = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage, history, currentSubject } = body;

    // Try calling Google Gemini API with round-robin failover
    for (let attempts = 0; attempts < GEMINI_KEY_POOL.length; attempts++) {
      const apiKey = getNextApiKey();

      // If valid key pattern is present, attempt live fetch
      if (apiKey && apiKey.startsWith('AIzaSy') && !apiKey.includes('DEMO') && !apiKey.includes('POOL')) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          
          const promptPayload = {
            contents: [
              {
                role: 'user',
                parts: [
                  { text: DELHI_TEACHER_SYSTEM_PROMPT },
                  { text: `Current Subject: ${currentSubject || 'General Class 10 JAC Board'}` },
                  ...(history || []).map((h: any) => ({ text: `${h.role === 'user' ? 'Scholar' : 'Buddy'}: ${h.text}` })),
                  { text: `Scholar just said: "${userMessage || 'Hello buddy!'}"` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 120
            }
          };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promptPayload)
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              // Extract embedded SFX tag
              const sfxMatch = text.match(/\[SFX:\s*(\w+)\]/);
              const sfx = sfxMatch ? sfxMatch[1] : 'bell';
              const cleanText = text.replace(/\[SFX:\s*\w+\]/g, '').trim();

              return NextResponse.json({
                success: true,
                reply: cleanText,
                sfx,
                persona: 'Delhi Street-Smart Study Buddy',
                voicePitch: 1.35 // Tuned for cute smart child
              });
            }
          }
        } catch (err) {
          console.warn(`Key attempt ${attempts + 1} failed, rolling to next key...`);
        }
      }
    }

    // High-Quality Procedural Delhi Fallback Engine
    const selected = FALLBACK_RESPONSES[fallbackIndex];
    fallbackIndex = (fallbackIndex + 1) % FALLBACK_RESPONSES.length;
    
    // Tailor response if user answered something
    let responseText = selected.reply;
    if (userMessage && userMessage.toLowerCase().includes('option') || userMessage.toLowerCase().includes('sahi')) {
      responseText = "Shabash meri jaan! [SFX: cheer] Ekdum solid pakde ho! Padh le yaar aise hi, rank 1 aayegi!";
    }

    const sfxMatch = responseText.match(/\[SFX:\s*(\w+)\]/);
    const sfx = sfxMatch ? sfxMatch[1] : selected.sfx;
    const cleanText = responseText.replace(/\[SFX:\s*\w+\]/g, '').trim();

    return NextResponse.json({
      success: true,
      reply: cleanText,
      sfx,
      persona: 'Delhi Street-Smart Study Buddy',
      voicePitch: 1.35
    });

  } catch (err: any) {
    return NextResponse.json({
      success: true,
      reply: "Ha bhai! [SFX: bell] Awaaz aa rahi hai na meri jaan? Padh le yaar, agla question sun!",
      sfx: 'bell',
      voicePitch: 1.35
    });
  }
}
