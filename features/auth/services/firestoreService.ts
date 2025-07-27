import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import type { UserPreferences } from '../../recommendation/types';

const PREFERENCES_DOC_PATH = (userId: string) => `users/${userId}`;

export const getUserPreferences = async (userId: string): Promise<Partial<UserPreferences>> => {
  if (!db) return {};
  try {
    const docRef = doc(db, PREFERENCES_DOC_PATH(userId));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
    return {};
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {};
  }
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>): Promise<void> => {
  if (!db) return;
  try {
    const docRef = doc(db, PREFERENCES_DOC_PATH(userId));
    await setDoc(docRef, preferences, { merge: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};
