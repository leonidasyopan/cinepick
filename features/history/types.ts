import type { UserAnswers, MovieRecommendation } from '../recommendation/types';

export interface HistoryItem {
  // From recommendation
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string;
  justifications: MovieRecommendation['justifications'];

  // History specific
  recommendationDate: any; // Firestore Timestamp
  watched: boolean;
  rating: 'liked' | 'disliked' | null;
  userAnswers: UserAnswers;
}
