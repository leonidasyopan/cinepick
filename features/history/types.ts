import type { UserAnswers } from '../recommendation/types';

export interface HistoryItem {
    // From recommendation
    tmdbId: number;
    title: string;
    year: number;
    posterPath: string;
    
    // History specific
    recommendationDate: any; // Firestore Timestamp
    watched: boolean;
    rating: 'liked' | 'disliked' | null;
    userAnswers: UserAnswers;
}
