export type QuestionTuple = [number, number, string, string[], number, string];

export interface Question {
  i: number; // Question ID
  d: 1 | 2 | 3 | 4 | 5; // Difficulty level (1=Easy, 2=Moderate, 3=Speed, 4=Hard, 5=Boss)
  q: string; // Question statement
  o: [string, string, string, string] | string[]; // 4 options
  a: number; // 0-indexed correct option (0=A, 1=B, 2=C, 3=D)
  e: string; // 1-line short explanation
}

export interface ChapterData {
  questions: Question[];
}
