// En: src/app/models/question.model.ts

export interface QuestionOption {
  letter: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  explanation: string | null; // Puede ser nula
  points: number;
  category: string;
  licenseClass: string; // 'B', 'C', etc.
  options: QuestionOption[];
  correctAnswer: string | string[]; // 'a' o ['a', 'c']
  multi: boolean;
}