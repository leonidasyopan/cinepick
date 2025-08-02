import type { MovieRecommendation, UserAnswers } from '../recommendation/types';

export interface HistoryItem {
    // The full recommendation object
    recommendation: MovieRecommendation;

    // History specific metadata
    recommendationDate: any; // Firestore Timestamp
    watched: boolean;
    rating: 'liked' | 'disliked' | null;
    userAnswers: UserAnswers; // Keep for context or future features
}
