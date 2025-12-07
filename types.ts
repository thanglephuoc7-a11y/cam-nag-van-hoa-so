
export interface KnowledgeItem {
  id: string;
  type: 'law' | 'ethics' | 'culture' | 'general';
  short_text: string;
  tip_or_checklist: string;
  infographic_link: string | null;
  source_type: 'law' | 'book' | 'web';
  source_ref: string;
}

export interface QuestionOption {
    id: number;
    text: string;
}

export interface Question {
  id: string;
  part: 'Đạo đức' | 'Pháp luật' | 'Văn hóa số';
  question: string;
  type?: 'multiple_choice' | 'true_false';
  options: QuestionOption[];
  correct_index: number;
  explanation: string;
  source_law_ref: string | null;
}

export interface QuizResult {
  timestamp: string;
  total_score: number;
  part_scores: { [key: string]: number };
  answers: { [questionId: string]: number };
}

export interface GameQuestion {
  id: string;
  topic: 'Văn hóa số' | 'Đạo đức số' | 'Pháp luật số';
  question: string;
  options: string[];
  correct_answer: string;
  points: 10 | 20 | 30 | 50;
  explanation: string;
}

// FIX: Added missing Scenario types
export interface ScenarioOption {
  id: number;
  text: string;
}

export interface Citation {
  title: string;
  excerpt: string;
}

export interface ScenarioResult {
  ethical_analysis: string;
  legal_analysis: string;
  recommended_action: string;
  positive_alternative: string;
  severity_score: number;
  citations: Citation[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  options: ScenarioOption[];
  feedback_per_option: {
    [key: number]: {
      ethical: string;
      legal: string;
      recommended_action: string;
      law_refs: string[];
      // Added fields to support local fallback data matching ScenarioResult
      positive_alternative?: string;
      severity_score?: number;
    };
  };
}


export type Lang = 'vi' | 'en';

export interface User {
  name: string;
  password?: string; // Password is used for auth, but shouldn't be passed around.
  lang: Lang;
  joinDate: string;
  lastLogin: string;
  avatarUrl?: string;
  bio?: string;
}

export interface ChatMessage { 
  role: 'user' | 'model'; 
  content: string; 
}

export interface ScenarioHistoryItem {
  scenarioId: string;
  choice: number;
  advisor_response: ScenarioResult;
  timestamp: string;
}