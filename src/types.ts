export interface QuestionComment {
  id: string;
  userName: string;
  role: 'student' | 'teacher' | 'ai';
  text: string;
  timestamp: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'geral' | 'especifico';
  area: string;
  year: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  alternatives: string[];
  correctAlternative: number; // index (0..4)
  commentary: string; // detailed expert explanation
  references: string; // bibliographic reference
  comments: QuestionComment[];
}

export interface SimulationHistoryItem {
  id: string;
  date: string;
  durationSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  areasStats: { [area: string]: { total: number; correct: number } };
}

export interface UserStats {
  points: number;
  completedQuestionsCount: number;
  correctCount: number;
  history: SimulationHistoryItem[];
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  unlockedAt?: string;
}
