export interface TasteMovie {
  tmdbId: number;
  title: string;
  posterPath: string;
  year: number;
}

// Stored in Firestore
export interface TastePreference {
  preferredId: number;
  rejectedId: number;
  timestamp: any;
}

// Used in the app, with full movie details
export interface TastePreferenceInfo {
  preferred: TasteMovie;
  rejected: TasteMovie;
}
