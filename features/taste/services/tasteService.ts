import * as firestore from 'firebase/firestore';
import { db } from '../../../firebase';
import type { TastePreference } from '../types';

const TASTE_PREFERENCES_COLLECTION_PATH = (userId: string) => `users/${userId}/tastePreferences`;
const USER_DOC_PATH = (userId: string) => `users/${userId}`;


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

export const getTasteProfile = async (userId: string): Promise<string | null> => {
  if (!db) return null;
  try {
    const docRef = firestore.doc(db, USER_DOC_PATH(userId));
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.tasteProfile) {
      return docSnap.data()?.tasteProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching taste profile:", error);
    return null;
  }
};

export const saveTasteProfile = async (userId: string, profileText: string): Promise<void> => {
  if (!db) return;
  try {
    const docRef = firestore.doc(db, USER_DOC_PATH(userId));
    await firestore.setDoc(docRef, { tasteProfile: profileText }, { merge: true });
  } catch (error) {
    console.error("Error saving taste profile:", error);
    throw error;
  }
};

export const getFavoriteMovieIds = async (userId: string): Promise<number[]> => {
  if (!db) return [];
  try {
    const docRef = firestore.doc(db, USER_DOC_PATH(userId));
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.favoriteMovieIds) {
      return docSnap.data()?.favoriteMovieIds || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching favorite movie IDs:", error);
    return [];
  }
};

export const saveFavoriteMovieIds = async (userId: string, favoriteIds: number[]): Promise<void> => {
  if (!db) return;
  try {
    const docRef = firestore.doc(db, USER_DOC_PATH(userId));
    await firestore.setDoc(docRef, { favoriteMovieIds: favoriteIds }, { merge: true });
  } catch (error) {
    console.error("Error saving favorite movie IDs:", error);
    throw error;
  }
};
