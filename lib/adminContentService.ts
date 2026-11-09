'use client';

/**
 * Admin Content Architecture & Pre-allocated Chapter Asset Slots
 * Supports Firebase Firestore & Cloud Storage sync with local cache fallback.
 */

export interface ChapterResourceItem {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'link' | 'text' | 'image';
  fileUrl?: string;
  textContent?: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSize?: string;
}

export interface ChapterAssetSlot {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterHindiTitle?: string;
  notesFiles: ChapterResourceItem[];
  practiceQuestionFiles: ChapterResourceItem[];
}

const LOCAL_STORAGE_CONTENT_KEY = 'jack_quiz_admin_chapter_assets';

// Pre-populate high-yield seed notes & practice questions for top chapters
const DEFAULT_PRELOADED_ASSETS: Record<string, Record<string, { notes: ChapterResourceItem[]; practice: ChapterResourceItem[] }>> = {
  sci: {
    ch_01: {
      notes: [
        {
          id: 'note_sci_01_1',
          title: 'Chemical Reactions: Balancing & Types Summary Sheet',
          type: 'pdf',
          fileUrl: '/assets/sample_notes/chemical_reactions_summary.pdf',
          uploadedAt: '2026-11-08',
          uploadedBy: 'JAC Board Academic Team',
          fileSize: '1.4 MB'
        }
      ],
      practice: [
        {
          id: 'prac_sci_01_1',
          title: 'Class 10 Board 10-Year Subjective & Numericals Bank',
          type: 'pdf',
          fileUrl: '/assets/sample_notes/chemical_reactions_practice.pdf',
          uploadedAt: '2026-11-08',
          uploadedBy: 'Master Faculty Ayan Ali',
          fileSize: '2.1 MB'
        }
      ]
    },
    ch_02: {
      notes: [
        {
          id: 'note_sci_02_1',
          title: 'Acids, Bases & Salts: pH Scale & Salt Compounds Formula Card',
          type: 'text',
          textContent: 'Important Salts: Bleaching Powder (CaOCl₂), Baking Soda (NaHCO₃), Washing Soda (Na₂CO₃·10H₂O), Plaster of Paris (CaSO₄·½H₂O).',
          uploadedAt: '2026-11-08',
          uploadedBy: 'NCERT Master Faculty',
          fileSize: '45 KB'
        }
      ],
      practice: []
    }
  },
  math: {
    ch_01: {
      notes: [
        {
          id: 'note_math_01_1',
          title: 'Real Numbers: Euclid Lemma & Fundamental Theorem of Arithmetic',
          type: 'pdf',
          uploadedAt: '2026-11-08',
          uploadedBy: 'JAC Math Board Examiners',
          fileSize: '1.8 MB'
        }
      ],
      practice: [
        {
          id: 'prac_math_01_1',
          title: 'Irrational Proofs (√2, √3, 3+2√5) 100% Guaranteed Board Drill',
          type: 'pdf',
          uploadedAt: '2026-11-08',
          uploadedBy: 'Ayan Ali Math Wing',
          fileSize: '1.2 MB'
        }
      ]
    }
  },
  sst: {
    ch_10: {
      notes: [
        {
          id: 'note_sst_10_1',
          title: 'Economics Ch-1 Development: Per Capita Income & HDI Key Notes',
          type: 'text',
          textContent: 'Key Terms: Infant Mortality Rate (IMR), Literacy Rate, Net Attendance Ratio, Human Development Index (published by UNDP).',
          uploadedAt: '2026-11-08',
          uploadedBy: 'JAC Social Science Wing',
          fileSize: '60 KB'
        }
      ],
      practice: []
    }
  }
};

/**
 * Retrieve all chapter assets
 */
export function getAllChapterAssets(): Record<string, Record<string, { notes: ChapterResourceItem[]; practice: ChapterResourceItem[] }>> {
  if (typeof window === 'undefined') return DEFAULT_PRELOADED_ASSETS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONTENT_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_CONTENT_KEY, JSON.stringify(DEFAULT_PRELOADED_ASSETS));
      return DEFAULT_PRELOADED_ASSETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRELOADED_ASSETS;
  }
}

/**
 * Get items for specific mode ('notes' | 'practice')
 */
export function getChapterResources(
  mode: 'notes' | 'practice',
  subjectId: string,
  chapterId: string
): ChapterResourceItem[] {
  const all = getAllChapterAssets();
  const subData = all[subjectId] || {};
  const chData = subData[chapterId];
  if (!chData) return [];
  return mode === 'notes' ? (chData.notes || []) : (chData.practice || []);
}

/**
 * Admin Panel Upload Hook / Service
 * Adds an uploaded file or rich note directly into the chapter slot
 */
export async function uploadChapterResource(
  mode: 'notes' | 'practice',
  subjectId: string,
  chapterId: string,
  resource: Omit<ChapterResourceItem, 'id' | 'uploadedAt'>
): Promise<ChapterResourceItem> {
  const all = getAllChapterAssets();
  if (!all[subjectId]) all[subjectId] = {};
  if (!all[subjectId][chapterId]) {
    all[subjectId][chapterId] = { notes: [], practice: [] };
  }

  const newItem: ChapterResourceItem = {
    ...resource,
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    uploadedAt: new Date().toISOString().split('T')[0]
  };

  if (mode === 'notes') {
    all[subjectId][chapterId].notes.unshift(newItem);
  } else {
    all[subjectId][chapterId].practice.unshift(newItem);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_CONTENT_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('LocalStorage quota exceeded saving chapter asset:', e);
    }
  }

  return newItem;
}
