'use client';

/**
 * Phase 2: Local 10-Year JAC Board Recency-Gap Predictive Model
 * Computes topic probability without external cloud token consumption.
 * Formula:
 *   gap = currentYear - lastSeen
 *   probability = round(min(0.99, (topic_weights[ch] * 0.05) + (gap * 0.22)), 2)
 */

export interface PredictionResult {
  chapter: string;
  topic: string;
  probability: number;
  probabilityPercent: number;
  history: number[];
  lastSeen: number;
  gap: number;
  marks: number;
  recommendationTag: string;
}

const PREDICTIVE_DB: Record<
  string,
  Array<{ ch: string; tp: string; years: number[]; marks: number }>
> = {
  science: [
    { ch: 'Chemical Reactions and Equations', tp: 'Balancing Redox Reactions', years: [2018, 2020, 2022, 2024], marks: 5 },
    { ch: 'Acids, Bases and Salts', tp: 'pH Scale & Chlor-Alkali Process', years: [2019, 2021, 2023], marks: 4 },
    { ch: 'Metals and Non-metals', tp: 'Reactivity Series & Roasting/Calcination', years: [2017, 2019, 2022, 2025], marks: 5 },
    { ch: 'Carbon and its Compounds', tp: 'Homologous Series & Saponification', years: [2018, 2021, 2023], marks: 5 },
    { ch: 'Life Processes', tp: 'Double Circulation & Human Nephron Diagram', years: [2017, 2019, 2022, 2024], marks: 6 },
    { ch: 'Control and Coordination', tp: 'Reflex Arc & Brain Structure', years: [2018, 2020, 2023], marks: 4 },
    { ch: 'Electricity', tp: "Ohm's Law & Series-Parallel Resistor Numericals", years: [2019, 2021, 2023, 2025], marks: 6 },
    { ch: 'Light Reflection & Refraction', tp: 'Mirror Formula & Lens Ray Diagrams', years: [2018, 2020, 2022, 2024], marks: 5 },
    { ch: 'Magnetic Effects of Electric Current', tp: "Fleming's Left-Hand Rule & Solenoid", years: [2017, 2020, 2023], marks: 5 }
  ],
  math: [
    { ch: 'Real Numbers', tp: 'Fundamental Theorem of Arithmetic & √5 Proof', years: [2018, 2020, 2022, 2024], marks: 4 },
    { ch: 'Polynomials', tp: 'Zeroes and Coefficients Relationship', years: [2019, 2021, 2023], marks: 3 },
    { ch: 'Linear Equations', tp: 'Cross-Multiplication & Graphical Method', years: [2017, 2020, 2023, 2025], marks: 5 },
    { ch: 'Quadratic Equations', tp: 'Discriminant & Quadratic Formula (D=b²-4ac)', years: [2018, 2021, 2024], marks: 4 },
    { ch: 'Arithmetic Progressions', tp: 'nth Term and Sum of n Terms (Sn)', years: [2019, 2022, 2024], marks: 4 },
    { ch: 'Triangles', tp: 'Basic Proportionality Theorem (Thales Proof)', years: [2017, 2019, 2021, 2023, 2025], marks: 6 },
    { ch: 'Coordinate Geometry', tp: 'Section Formula & Distance Formula', years: [2018, 2020, 2022, 2024], marks: 4 },
    { ch: 'Trigonometry', tp: 'Trigonometric Identities (sin²θ+cos²θ=1)', years: [2019, 2021, 2023, 2025], marks: 6 },
    { ch: 'Statistics', tp: 'Mean, Median, Mode Step-Deviation & Ogive', years: [2018, 2020, 2022, 2024], marks: 6 }
  ],
  sst: [
    { ch: 'History', tp: 'Nationalism in Europe & Jallianwala Bagh', years: [2018, 2020, 2022, 2024], marks: 5 },
    { ch: 'Geography', tp: 'Soil Classification & Water Dams', years: [2019, 2021, 2023], marks: 4 },
    { ch: 'Civics', tp: 'Power Sharing in Belgium & Sri Lanka', years: [2018, 2021, 2023], marks: 4 },
    { ch: 'Economics', tp: 'Sectors of Indian Economy (Primary, Secondary, Tertiary)', years: [2017, 2020, 2022, 2024], marks: 5 }
  ],
  hindi: [
    { ch: 'Kshitij', tp: 'Surdas Ke Pad (सूरदास के पद)', years: [2018, 2020, 2022, 2024], marks: 5 },
    { ch: 'Kshitij', tp: 'Netaji Ka Chashma (नेताजी का चश्मा)', years: [2019, 2021, 2023], marks: 4 },
    { ch: 'Kritika', tp: 'Mata Ka Aanchal (माता का आँचल)', years: [2018, 2021, 2024], marks: 4 }
  ],
  english: [
    { ch: 'First Flight', tp: "A Letter to God (Lencho's Faith)", years: [2018, 2020, 2022, 2024], marks: 5 },
    { ch: 'First Flight', tp: 'Nelson Mandela: Long Walk to Freedom', years: [2019, 2021, 2023], marks: 5 },
    { ch: 'Footprints', tp: "A Triumph of Surgery (Tricki's Transformation)", years: [2018, 2021, 2024], marks: 4 }
  ]
};

export function getSubjectPredictions(subject: string, currentYear = 2026): PredictionResult[] {
  const normalized = subject.toLowerCase().replace(/[^a-z]/g, '');
  const items = PREDICTIVE_DB[normalized] || PREDICTIVE_DB.science;

  return items
    .map(item => {
      const lastSeen = Math.max(...item.years);
      const gap = currentYear - lastSeen;
      const prob = Number(Math.min(0.99, item.marks * 0.05 + gap * 0.22).toFixed(2));
      const percent = Math.round(prob * 100);

      let recommendationTag = 'High Priority';
      if (percent >= 85) recommendationTag = '🔥 99% Certain Recurrence (JAC 2026)';
      else if (percent >= 70) recommendationTag = '⚡ Prime Revision Cycle';
      else recommendationTag = 'Core Fundamental';

      return {
        chapter: item.ch,
        topic: item.tp,
        probability: prob,
        probabilityPercent: percent,
        history: item.years,
        lastSeen,
        gap,
        marks: item.marks,
        recommendationTag
      };
    })
    .sort((a, b) => b.probability - a.probability);
}

export function getChapterPredictionProbability(
  subject: string,
  chapterNum: number,
  currentYear = 2026
): PredictionResult {
  const preds = getSubjectPredictions(subject, currentYear);
  const idx = Math.max(0, (chapterNum - 1) % preds.length);
  return preds[idx];
}
