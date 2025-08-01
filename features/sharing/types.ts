import type { MovieRecommendation, UserAnswers } from '../recommendation/types';

export interface SharedRecommendationData {
  recommendation: MovieRecommendation;
  userAnswers: UserAnswers;
  createdAt: any; // Firestore Timestamp
  locale?: string;
  sharerName?: string;
}
