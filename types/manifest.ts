export interface ChapterMeta {
  chId: string;
  num: number;
  name: string;
  levels: number;
  file: string;
}

export interface SubjectMeta {
  id: string; // 'sci' | 'math' | 'sst' | 'hin' | 'eng'
  title: string;
  themeColor: string;
  accent3D: string;
  totalChapters: number;
  chapters: ChapterMeta[];
}

export interface Manifest {
  subjects: SubjectMeta[];
}
