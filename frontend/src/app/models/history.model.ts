import { Question } from './question.model';

// Interfaz para la lista del historial (GET /api/history/:classType)
export interface TestResult {
  id: number;
  score: number;
  total_questions: number;
  status: 'Aprobado' | 'Reprobado';
  created_at: string;
  user_id: number;
  license_class: string;
}

// Interfaz para el payload DETALLADO que ENVIAMOS al guardar (POST /api/history)
export interface DetailedTestResultPayload {
  score: number;
  totalQuestions: number;
  status: 'Aprobado' | 'Reprobado';
  questions: Question[];
  userAnswers: any;
  classType: string;
}

// Interfaz para la RESPUESTA que recibimos al GUARDAR
export interface TestHistorySummary {
  id: number;
  score: number;
  total_questions: number;
  status: string;
  user_id: number;
  created_at: string;
  license_class: string;
}

// Interfaz para la RESPUESTA al OBTENER DETALLES (GET /api/history/details/:id)
export interface TestDetailResponse {
  summary: TestHistorySummary;
  details: {
    detailId: number;
    isCorrect: boolean;
    userAnswer: string | string[] | null;
    question: Question;
  }[];
}

// 👇 --- AÑADE ESTA INTERFAZ --- 👇
// Interfaz para la RESPUESTA del backend (GET /api/history/stats/:classType)
export interface TestStats {
  totalRealizados: number;
  totalAprobados: number;
}