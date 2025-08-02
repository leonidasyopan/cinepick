import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getTastePreferences, addTastePreference } from './services/tasteService';
import { TASTE_CHALLENGER_MOVIES, INITIAL_TASTE_PAIR } from './constants';
import type { TasteMovie, TastePreference, TastePreferenceInfo } from './types';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface TasteContextType {
  tastePreferences: TastePreferenceInfo[];
  isLoading: boolean;
  classifyPreference: (winner: TasteMovie, loser: TasteMovie) => Promise<void>;
  currentPair: [TasteMovie, TasteMovie] | null;
  classifiedCount: number;
  totalMoviesInGame: number;
}

const TasteContext = createContext<TasteContextType | undefined>(undefined);

const allMovies: TasteMovie[] = [...INITIAL_TASTE_PAIR, ...TASTE_CHALLENGER_MOVIES];
const moviesById = new Map(allMovies.map(movie => [movie.tmdbId, movie]));

export const TasteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tastePreferences, setTastePreferences] = useState<TastePreferenceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [challengerQueue, setChallengerQueue] = useState<TasteMovie[]>([]);
  const [currentWinner, setCurrentWinner] = useState<TasteMovie>(INITIAL_TASTE_PAIR[0]);

  // Fetch initial preferences on user change
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getTastePreferences(user.uid)
        .then(prefs => {
          const detailedPrefs = prefs
            .map(p => ({
              preferred: moviesById.get(p.preferredId),
              rejected: moviesById.get(p.rejectedId),
            }))
            .filter(p => p.preferred && p.rejected) as TastePreferenceInfo[];

          setTastePreferences(detailedPrefs);

          // Setup the game state based on saved preferences
          const classifiedIds = new Set(prefs.flatMap(p => [p.preferredId, p.rejectedId]));
          const remainingChallengers = TASTE_CHALLENGER_MOVIES.filter(m => !classifiedIds.has(m.tmdbId));
          setChallengerQueue(shuffleArray(remainingChallengers));

          // Set the current reigning champion if there's history
          if (detailedPrefs.length > 0) {
            setCurrentWinner(detailedPrefs[0].preferred);
          } else {
            setCurrentWinner(INITIAL_TASTE_PAIR[0]);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setTastePreferences([]);
      setChallengerQueue(shuffleArray(TASTE_CHALLENGER_MOVIES));
      setCurrentWinner(INITIAL_TASTE_PAIR[0]);
      setIsLoading(false);
    }
  }, [user]);

  const classifyPreference = useCallback(async (winner: TasteMovie, loser: TasteMovie) => {
    if (!user) return;

    // Optimistic update
    setTastePreferences(prev => [{ preferred: winner, rejected: loser }, ...prev]);
    setCurrentWinner(winner);
    setChallengerQueue(prev => prev.filter(m => m.tmdbId !== winner.tmdbId && m.tmdbId !== loser.tmdbId));

    try {
      await addTastePreference(user.uid, winner.tmdbId, loser.tmdbId);
    } catch (error) {
      console.error("Failed to save taste preference, reverting optimistic update.", error);
      // Revert on failure
      setTastePreferences(prev => prev.filter(p => p.preferred.tmdbId !== winner.tmdbId || p.rejected.tmdbId !== loser.tmdbId));
      // A more robust solution might re-fetch from Firestore here.
    }
  }, [user]);

  const getCurrentPair = (): [TasteMovie, TasteMovie] | null => {
    // Initial state before any classifications
    if (tastePreferences.length === 0) {
      return INITIAL_TASTE_PAIR;
    }

    const nextChallenger = challengerQueue[0];
    if (!nextChallenger) {
      return null; // Game over
    }

    // Ensure the current winner isn't fighting itself
    if (currentWinner.tmdbId === nextChallenger.tmdbId) {
      const alternateChallenger = challengerQueue[1];
      if (!alternateChallenger) return null; // Game over
      return [currentWinner, alternateChallenger];
    }

    return [currentWinner, nextChallenger];
  };

  const value = {
    tastePreferences,
    isLoading,
    classifyPreference,
    currentPair: getCurrentPair(),
    classifiedCount: tastePreferences.length,
    totalMoviesInGame: allMovies.length,
  };

  return <TasteContext.Provider value={value}>{children}</TasteContext.Provider>;
};

export const useTaste = (): TasteContextType => {
  const context = useContext(TasteContext);
  if (context === undefined) {
    throw new Error('useTaste must be used within a TasteProvider');
  }
  return context;
};
