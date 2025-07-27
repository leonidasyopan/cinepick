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
  directUrl?: string;
  imdb_id?: string;
  tmdb_id?: number;
}
export interface MovieRecommendation {
  title: string;
  year: number;
  justification: string;
  trailerSearchQuery: string;
  // --- New fields from TMDb ---
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
  tmdbId?: number; // TMDB's ID for the movie
  watchProviders?: WatchProvider[];
  // Fallback for original streaming services list
  streamingServices?: string[];
}

export type PartialUserAnswers = Partial<UserAnswers>;

export interface UserPreferences {
  startYear: number;
  ageRating: 'Any' | 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
}
