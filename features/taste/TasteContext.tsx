
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getTastePreferences, addTastePreference } from './services/tasteService';
import { TASTE_CHALLENGER_MOVIES, INITIAL_TASTE_PAIR } from './constants';
import type { TasteMovie, TastePreference, TastePreferenceInfo } from './types';
import { preloadImage, TASTE_IMAGE_BASE_URL } from './services/tasteImageService';

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
  const [currentWinner, setCurrentWinner] = useState<TasteMovie | null>(null);
  const [classifiedCount, setClassifiedCount] = useState(0);

  // Effect to preload the static initial pair once on mount. This ensures the very
  // first images shown to a new user are fetched as early as possible.
  useEffect(() => {
    INITIAL_TASTE_PAIR.forEach(movie => {
      if (movie.posterPath) preloadImage(`${TASTE_IMAGE_BASE_URL}${movie.posterPath}`);
    });
  }, []);

  // Effect to setup game state based on user login status.
  useEffect(() => {
    const setupInitialState = (prefs: TastePreferenceInfo[], classifiedIds: Set<number>) => {
      const remainingChallengers = TASTE_CHALLENGER_MOVIES.filter(m => !classifiedIds.has(m.tmdbId));
      setChallengerQueue(shuffleArray(remainingChallengers));

      const winner = prefs.length > 0 ? prefs[0].preferred : INITIAL_TASTE_PAIR[0];
      setCurrentWinner(winner);
    };

    if (user) {
      setIsLoading(true);
      getTastePreferences(user.uid)
        .then(prefsFromDb => {
          const detailedPrefs = prefsFromDb
            .map(p => ({
              preferred: moviesById.get(p.preferredId),
              rejected: moviesById.get(p.rejectedId),
            }))
            .filter(p => p.preferred && p.rejected) as TastePreferenceInfo[];

          const classifiedIds = new Set(prefsFromDb.flatMap(p => [p.preferredId, p.rejectedId]));

          setTastePreferences(detailedPrefs);
          setClassifiedCount(detailedPrefs.length);
          setupInitialState(detailedPrefs, classifiedIds);
        })
        .finally(() => setIsLoading(false));
    } else {
      // Logged-out state: reset everything.
      setTastePreferences([]);
      setClassifiedCount(0);
      setupInitialState([], new Set<number>());
      setIsLoading(false);
    }
  }, [user]);

  // Effect to preload the next batch of challengers.
  useEffect(() => {
    // Preload the next 4 potential challengers
    challengerQueue.slice(0, 4).forEach(movie => {
      if (movie.posterPath) preloadImage(`${TASTE_IMAGE_BASE_URL}${movie.posterPath}`);
    });
  }, [challengerQueue]);

  // Effect to preload the current champion's image. This is crucial for returning
  // users, whose champion might not be in the initial pair.
  useEffect(() => {
    if (currentWinner && currentWinner.posterPath) {
      preloadImage(`${TASTE_IMAGE_BASE_URL}${currentWinner.posterPath}`);
    }
  }, [currentWinner]);

  const classifyPreference = useCallback(async (winner: TasteMovie, loser: TasteMovie) => {
    const newPreference: TastePreferenceInfo = { preferred: winner, rejected: loser };
    const oldState = {
      prefs: tastePreferences,
      queue: challengerQueue,
      winner: currentWinner,
      count: classifiedCount,
    };

    // Optimistic update for both logged-in and logged-out users
    setTastePreferences(prev => [newPreference, ...prev]);
    setCurrentWinner(winner);

    // For any round after the initial one, the challenger is at the head of the queue.
    // We need to remove them to proceed to the next challenger.
    if (classifiedCount > 0) {
      setChallengerQueue(prev => prev.slice(1));
    }

    setClassifiedCount(prev => prev + 1);

    if (user) {
      try {
        await addTastePreference(user.uid, winner.tmdbId, loser.tmdbId);
      } catch (error) {
        console.error("Failed to save taste preference, reverting optimistic update.", error);
        // Revert state on failure
        setTastePreferences(oldState.prefs);
        setChallengerQueue(oldState.queue);
        setCurrentWinner(oldState.winner);
        setClassifiedCount(oldState.count);
      }
    }
  }, [user, tastePreferences, challengerQueue, currentWinner, classifiedCount]);

  const getCurrentPair = (): [TasteMovie, TasteMovie] | null => {
    if (isLoading) return null;

    // At the very beginning, before any classifications
    if (classifiedCount === 0) {
      return INITIAL_TASTE_PAIR;
    }

    if (!currentWinner || challengerQueue.length === 0) {
      return null; // Game over
    }

    // The next challenger is always the first in the queue
    const nextChallenger = challengerQueue[0];

    // This is a safeguard against the very bug we are fixing. Should not be needed with the new logic, but it's safe to keep.
    if (currentWinner.tmdbId === nextChallenger.tmdbId) {
      // This indicates a state error. Let's try to recover by advancing the queue.
      if (challengerQueue.length > 1) {
        return [currentWinner, challengerQueue[1]];
      }
      return null; // Game over if no other challengers are left.
    }

    return [currentWinner, nextChallenger];
  };

  const value = {
    tastePreferences,
    isLoading,
    classifyPreference,
    currentPair: getCurrentPair(),
    classifiedCount: classifiedCount,
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
