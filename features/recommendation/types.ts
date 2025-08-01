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

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  link: string;
}
export interface MovieRecommendation {
  title: string;
  year: number;
  justification: string;
  trailerSearchQuery: string;
  // --- New fields from TMDb ---
  tmdbId?: number;
  originalTitle?: string;
  posterPath?: string;
  synopsis?: string;
  runtime?: number; // in minutes
  rating?: {
    score: number;
    source: string; // e.g., "TMDb"
  };
  cast?: string[];
  director?: string;
  imdbId?: string;
  watchProviders?: WatchProvider[];
  // Fallback for original streaming services list
  streamingServices?: string[];
}

export type PartialUserAnswers = Partial<UserAnswers>;

export interface UserPreferences {
  startYear: number;
  ageRating: 'Any' | 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
}