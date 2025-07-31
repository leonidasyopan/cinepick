import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import type { SharedRecommendationData } from '../types';

const SHARED_RECOMMENDATIONS_COLLECTION_PATH = 'sharedRecommendations';

export const saveSharedRecommendation = async (id: string, data: Omit<SharedRecommendationData, 'createdAt'>): Promise<void> => {
  if (!db) throw new Error("Firebase is not initialized.");
  try {
    const docData: SharedRecommendationData = {
      ...data,
      createdAt: serverTimestamp(),
    };
    const docRef = doc(db, SHARED_RECOMMENDATIONS_COLLECTION_PATH, id);
    await setDoc(docRef, docData);
  } catch (error) {
    console.error("Error saving shared recommendation:", error);
    throw new Error("Failed to save share data to database.");
  }
};

export const getSharedRecommendation = async (id: string): Promise<SharedRecommendationData | null> => {
  if (!db) return null;
  try {
    const docRef = doc(db, SHARED_RECOMMENDATIONS_COLLECTION_PATH, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SharedRecommendationData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching shared recommendation:", error);
    return null;
  }
};