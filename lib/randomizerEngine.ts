import { Question, QuestionTuple } from '@/types/question';

export interface DrillQuestionItem {
  id: number;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  subjectId: string;
  chapterId: string;
}

// In-memory cache keyed by `${subjectId}_${language}`
const subjectQuestionsCache: Record<string, DrillQuestionItem[]> = {};

/**
 * Loads all chapter files for a given subject across the 69-chapter JSON bank,
 * aggregates them (supporting both object arrays and legacy tuple payloads),
 * and returns a 100% randomized question array.
 */
export async function getSubjectRandomDrillQuestions(
  subjectId: string,
  limit = 20,
  language: 'hi' | 'en' = 'hi'
): Promise<DrillQuestionItem[]> {
  const cacheKey = `${subjectId}_${language}`;

  if (subjectQuestionsCache[cacheKey] && subjectQuestionsCache[cacheKey].length > 0) {
    return shuffleArray([...subjectQuestionsCache[cacheKey]]).slice(0, limit);
  }

  const subjectFolderMap: Record<string, { folder: string; chaptersCount: number }> = {
    sci: { folder: 'science', chaptersCount: 13 },
    science: { folder: 'science', chaptersCount: 13 },
    math: { folder: 'math', chaptersCount: 14 },
    sst: { folder: 'social_science', chaptersCount: 14 },
    hin: { folder: 'hindi', chaptersCount: 14 },
    hindi: { folder: 'hindi', chaptersCount: 14 },
    eng: { folder: 'english', chaptersCount: 14 },
    english: { folder: 'english', chaptersCount: 14 }
  };

  const meta = subjectFolderMap[subjectId] || { folder: 'science', chaptersCount: 13 };
  const targetFolder = language === 'en' ? `${meta.folder}_en` : meta.folder;
  const allQuestions: DrillQuestionItem[] = [];

  const fetchPromises: Promise<void>[] = [];

  for (let ch = 1; ch <= meta.chaptersCount; ch++) {
    const chStr = String(ch).padStart(2, '0');
    const url = `/data/${targetFolder}/ch_${chStr}.json`;

    fetchPromises.push(
      fetch(url)
        .then(res => (res.ok ? res.json() : null))
        .then((data: Question[] | { questions?: QuestionTuple[] } | null) => {
          if (Array.isArray(data)) {
            data.forEach(q => {
              if (q && q.q && Array.isArray(q.o) && q.o.length >= 2) {
                allQuestions.push({
                  id: q.i,
                  question: q.q,
                  options: q.o,
                  answer: q.a,
                  explanation: q.e || '',
                  subjectId,
                  chapterId: `${subjectId}_ch${chStr}`
                });
              }
            });
          } else if (data && Array.isArray(data.questions)) {
            data.questions.forEach(q => {
              allQuestions.push({
                id: q[0],
                question: q[2],
                options: q[3],
                answer: q[4],
                explanation: q[5] || '',
                subjectId,
                chapterId: `${subjectId}_ch${chStr}`
              });
            });
          }
        })
        .catch(err => {
          console.warn(`Failed to prefetch chapter ${url}:`, err);
        })
    );
  }

  await Promise.all(fetchPromises);

  if (allQuestions.length > 0) {
    subjectQuestionsCache[cacheKey] = allQuestions;
    return shuffleArray([...allQuestions]).slice(0, limit);
  }

  return getFallbackSubjectQuestions(subjectId).slice(0, limit);
}

/**
 * Pure Fisher-Yates array shuffling
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getFallbackSubjectQuestions(subjectId: string): DrillQuestionItem[] {
  return [
    {
      id: 101,
      question: 'मैग्नीशियम रिबन को वायु में जलाने पर क्या बनता है?',
      options: ['मैग्नीशियम ऑक्साइड', 'मैग्नीशियम हाइड्रॉक्साइड', 'मैग्नीशियम कार्बोनेट', 'मैग्नीशियम क्लोराइड'],
      answer: 0,
      explanation: '2Mg + O₂ → 2MgO (मैग्नीशियम ऑक्साइड का सफेद चूर्ण बनता है)',
      subjectId,
      chapterId: `${subjectId}_ch01`
    },
    {
      id: 102,
      question: 'द्विघात समीकरण ax² + bx + c = 0 का विविक्तकर (D) क्या होता है?',
      options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', '√b² - 4ac'],
      answer: 0,
      explanation: 'विविक्तकर D = b² - 4ac',
      subjectId,
      chapterId: `${subjectId}_ch01`
    },
    {
      id: 103,
      question: 'शुद्ध जल का pH मान कितना होता है?',
      options: ['0', '7', '14', '1'],
      answer: 1,
      explanation: 'शुद्ध जल उदासीन होता है, इसलिए इसका pH = 7 होता है।',
      subjectId,
      chapterId: `${subjectId}_ch01`
    },
    {
      id: 104,
      question: 'वियना कांग्रेस किस वर्ष आयोजित की गई थी?',
      options: ['1815', '1820', '1830', '1848'],
      answer: 0,
      explanation: '1815 में नेपोलियन की हार के बाद वियना सम्मेलन हुआ।',
      subjectId,
      chapterId: `${subjectId}_ch01`
    }
  ];
}
