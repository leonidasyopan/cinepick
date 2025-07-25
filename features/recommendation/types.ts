
export interface RefinementPair {
  optionA: string;
  optionB: string;
  description: string;
}

export interface UserAnswers {
  mood: string;
  subMood: string;
  occasion: string;
  refinements: string[];
}

export interface TranslatedUserAnswers {
    mood: string;
    subMood: string;
    occasion: string;
    refinements: string[];
}

export interface MovieRecommendation {
  title: string;
  year: number;
  justification: string;
  streamingServices: string[];
  trailerSearchQuery: string;
}

export type PartialUserAnswers = Partial<UserAnswers>;
