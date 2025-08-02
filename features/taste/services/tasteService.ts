import * as firestore from 'firebase/firestore';
import { db } from '../../../firebase';
import type { TastePreference } from '../types';

const TASTE_PREFERENCES_COLLECTION_PATH = (userId: string) => `users/${userId}/tastePreferences`;

export const getTastePreferences = async (userId: string): Promise<TastePreference[]> => {
  if (!db) return [];
  try {
    const collectionRef = firestore.collection(db, TASTE_PREFERENCES_COLLECTION_PATH(userId));
    const q = firestore.query(collectionRef, firestore.orderBy('timestamp', 'desc'));
    const querySnapshot = await firestore.getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TastePreference);
  } catch (error) {
    console.error("Error fetching user taste preferences:", error);
    return [];
  }
};

export const addTastePreference = async (userId: string, preferredId: number, rejectedId: number): Promise<void> => {
  if (!db) return;
  try {
    const preference: Omit<TastePreference, 'timestamp'> & { timestamp: any } = {
      preferredId,
      rejectedId,
      timestamp: firestore.serverTimestamp(),
    };
    const collectionRef = firestore.collection(db, TASTE_PREFERENCES_COLLECTION_PATH(userId));
    await firestore.addDoc(collectionRef, preference);
  } catch (error) {
    console.error("Error adding taste preference:", error);
    throw error;
  }
};
