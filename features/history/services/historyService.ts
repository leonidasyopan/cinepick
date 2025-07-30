import { doc, setDoc, getDocs, collection, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import type { MovieRecommendation, UserAnswers } from '../../recommendation/types';
import type { HistoryItem } from '../types';

const HISTORY_COLLECTION_PATH = (userId: string) => `users/${userId}/history`;
const HISTORY_DOC_PATH = (userId: string, tmdbId: number) => `users/${userId}/history/${tmdbId}`;

export const addRecommendationToHistory = async (userId: string, recommendation: MovieRecommendation, answers: UserAnswers): Promise<void> => {
  if (!db || !recommendation.tmdbId) return;
  try {
    const historyItem: HistoryItem = {
      tmdbId: recommendation.tmdbId,
      title: recommendation.title,
      year: recommendation.year,
      posterPath: recommendation.posterPath || '',
      recommendationDate: serverTimestamp(),
      watched: false,
      rating: null,
      userAnswers: answers,
    };
    const docRef = doc(db, HISTORY_DOC_PATH(userId, recommendation.tmdbId));
    // Use set with merge to create or update (e.g., if a movie is recommended again, it updates the timestamp)
    await setDoc(docRef, historyItem, { merge: true });
  } catch (error) {
    console.error("Error adding recommendation to history:", error);
    throw error;
  }
};

export const getUserHistory = async (userId: string): Promise<HistoryItem[]> => {
  if (!db) return [];
  try {
    const historyCollection = collection(db, HISTORY_COLLECTION_PATH(userId));
    const q = query(historyCollection, orderBy('recommendationDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as HistoryItem);
  } catch (error) {
    console.error("Error fetching user history:", error);
    return [];
  }
};

export const updateHistoryItemStatus = async (userId: string, tmdbId: number, updates: Partial<Pick<HistoryItem, 'watched' | 'rating'>>): Promise<void> => {
  if (!db) return;
  try {
    const docRef = doc(db, HISTORY_DOC_PATH(userId, tmdbId));
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating history item:", error);
    throw error;
  }
};
