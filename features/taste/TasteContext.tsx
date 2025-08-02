
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getTastePreferences, addTastePreference } from './services/tasteService';
import { TASTE_GAME_MOVIE_IDS, INITIAL_TASTE_IDS } from './constants';
import type { TasteMovie, TastePreference, TastePreferenceInfo } from './types';
import { preloadImage, TASTE_IMAGE_BASE_URL, fetchAllTasteMovies } from './services/tasteImageService';

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

export const TasteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tastePreferences, setTastePreferences] = useState<TastePreferenceInfo[]>([]);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [isFetchingUserPrefs, setIsFetchingUserPrefs] = useState(true);
  const [allMovies, setAllMovies] = useState<TasteMovie[]>([]);
  const [moviesById, setMoviesById] = useState<Map<number, TasteMovie>>(new Map());

  const [challengerQueue, setChallengerQueue] = useState<TasteMovie[]>([]);
  const [currentWinner, setCurrentWinner] = useState<TasteMovie | null>(null);

  // Effect 1: Fetch all movie data from TMDb API on component mount.
  useEffect(() => {
    setIsFetchingInitialData(true);
    fetchAllTasteMovies(TASTE_GAME_MOVIE_IDS)
      .then(fetchedMovies => {
        setAllMovies(fetchedMovies);
        setMoviesById(new Map(fetchedMovies.map(movie => [movie.tmdbId, movie])));
      })
      .catch(error => console.error("Failed to fetch initial movie data.", error))
      .finally(() => setIsFetchingInitialData(false));
  }, []);

  // Effect 2: Setup game state when user or initial movie data changes.
  useEffect(() => {
    if (isFetchingInitialData || allMovies.length === 0) return;

    const setupGameState = (prefs: TastePreferenceInfo[]) => {
      const winner = prefs.length > 0 ? prefs[0].preferred : moviesById.get(INITIAL_TASTE_IDS[0]);
      if (!winner) return;
      setCurrentWinner(winner);

      const classifiedIds = new Set(prefs.flatMap(p => [p.preferred.tmdbId, p.rejected.tmdbId]));
      const initialPairIds = new Set(INITIAL_TASTE_IDS);

      const remainingChallengers = allMovies.filter(m =>
        !initialPairIds.has(m.tmdbId) && !classifiedIds.has(m.tmdbId)
      );
      setChallengerQueue(shuffleArray(remainingChallengers));
    };

    if (user) {
      setIsFetchingUserPrefs(true);
      getTastePreferences(user.uid)
        .then(prefsFromDb => {
          const detailedPrefs = prefsFromDb
            .map(p => ({
              preferred: moviesById.get(p.preferredId),
              rejected: moviesById.get(p.rejectedId),
            }))
            .filter(p => p.preferred && p.rejected) as TastePreferenceInfo[];

          setTastePreferences(detailedPrefs);
          setupGameState(detailedPrefs);
        })
        .finally(() => setIsFetchingUserPrefs(false));
    } else {
      setTastePreferences([]);
      setupGameState([]);
      setIsFetchingUserPrefs(false);
    }
  }, [user, allMovies, moviesById, isFetchingInitialData]);

  // Effect 3: Preload images for the challenger queue and current champion.
  useEffect(() => {
    challengerQueue.slice(0, 4).forEach(movie => {
      if (movie.posterPath) preloadImage(`${TASTE_IMAGE_BASE_URL}${movie.posterPath}`);
    });
    if (currentWinner?.posterPath) {
      preloadImage(`${TASTE_IMAGE_BASE_URL}${currentWinner.posterPath}`);
    }
  }, [challengerQueue, currentWinner]);

  const classifyPreference = useCallback(async (winner: TasteMovie, loser: TasteMovie) => {
    const newPreference: TastePreferenceInfo = { preferred: winner, rejected: loser };
    const oldState = { prefs: tastePreferences, queue: challengerQueue, winner: currentWinner };

    setTastePreferences(prev => [newPreference, ...prev]);
    setCurrentWinner(winner);

    // The showdown is over, remove the challenger that just competed from the queue.
    // This prevents them from appearing again.
    if (tastePreferences.length > 0) {
      setChallengerQueue(prev => prev.slice(1));
    }

    if (user) {
      try {
        await addTastePreference(user.uid, winner.tmdbId, loser.tmdbId);
      } catch (error) {
        console.error("Failed to save taste preference, reverting optimistic update.", error);
        setTastePreferences(oldState.prefs);
        setChallengerQueue(oldState.queue);
        setCurrentWinner(oldState.winner);
      }
    }
  }, [user, tastePreferences, challengerQueue, currentWinner]);

  const getCurrentPair = (): [TasteMovie, TasteMovie] | null => {
    if (isFetchingInitialData || isFetchingUserPrefs) return null;

    if (tastePreferences.length === 0) {
      const movieA = moviesById.get(INITIAL_TASTE_IDS[0]);
      const movieB = moviesById.get(INITIAL_TASTE_IDS[1]);
      return movieA && movieB ? [movieA, movieB] : null;
    }

    if (!currentWinner || challengerQueue.length === 0) {
      return null; // Game over
    }

    const nextChallenger = challengerQueue[0];
    return [currentWinner, nextChallenger];
  };

  const value = {
    tastePreferences,
    isLoading: isFetchingInitialData || isFetchingUserPrefs,
    classifyPreference,
    currentPair: getCurrentPair(),
    classifiedCount: tastePreferences.length,
    totalMoviesInGame: allMovies.length > 0 ? allMovies.length : TASTE_GAME_MOVIE_IDS.length,
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
