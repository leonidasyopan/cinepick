import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../../firebase';
import { getUserPreferences, updateUserPreferences as setFirestorePreferences } from './services/firestoreService';
import type { UserPreferences } from '../recommendation/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  preferences: Partial<UserPreferences>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  startYear: 1980,
  ageRating: 'Any',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>(defaultPreferences);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const storedPrefs = await getUserPreferences(currentUser.uid);
        setPreferences({ ...defaultPreferences, ...storedPrefs });
      } else {
        setPreferences(defaultPreferences);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserPreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    if (user) {
      await setFirestorePreferences(user.uid, prefs);
      setPreferences(currentPrefs => ({ ...currentPrefs, ...prefs }));
    }
  }, [user]);

  const logout = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
  };

  const value = { user, loading, preferences, updateUserPreferences, logout, isFirebaseEnabled };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
