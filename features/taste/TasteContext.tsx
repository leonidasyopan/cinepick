
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getTastePreferences, addTastePreference } from './services/tasteService';
import { TASTE_GAME_MOVIE_IDS } from './constants';
import type { TasteMovie, TastePreferenceInfo } from './types';
import { preloadImage, TASTE_IMAGE_BASE_URL, fetchAllTasteMovies } from './services/tasteImageService';

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

  // Effect 1: Fetch all movie data from TMDb API on component mount.
  useEffect(() => {
    setIsFetchingInitialData(true);
    fetchAllTasteMovies(TASTE_GAME_MOVIE_IDS)
      .then(fetchedMovies => {
        // Ensure fetched movies follow the same order as the ID list
        const fetchedMoviesMap = new Map(fetchedMovies.map(m => [m.tmdbId, m]));
        const orderedMovies = TASTE_GAME_MOVIE_IDS.map(id => fetchedMoviesMap.get(id)).filter(Boolean) as TasteMovie[];

        setAllMovies(orderedMovies);
        setMoviesById(new Map(orderedMovies.map(movie => [movie.tmdbId, movie])));
      })
      .catch(error => console.error("Failed to fetch initial movie data.", error))
      .finally(() => setIsFetchingInitialData(false));
  }, []);

  // Effect 2: Fetch user preferences when user or initial movie data changes.
  useEffect(() => {
    if (isFetchingInitialData || allMovies.length === 0) return;

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
        })
        .finally(() => setIsFetchingUserPrefs(false));
    } else {
      setTastePreferences([]);
      setIsFetchingUserPrefs(false);
    }
  }, [user, allMovies.length, moviesById, isFetchingInitialData]);

  // --- Derived State Calculation ---
  const isLoading = isFetchingInitialData || isFetchingUserPrefs;

  const classifiedIds = new Set(tastePreferences.flatMap(p => [p.preferred.tmdbId, p.rejected.tmdbId]));

  let currentPair: [TasteMovie, TasteMovie] | null = null;
  let nextChallengers: TasteMovie[] = [];

  if (!isLoading && allMovies.length > 0) {
    if (tastePreferences.length === 0) {
      if (allMovies.length >= 2) {
        currentPair = [allMovies[0], allMovies[1]];
        nextChallengers = allMovies.slice(2);
      }
    } else {
      const lastWinner = tastePreferences[0].preferred;
      const nextUnclassifiedMovie = allMovies.find(movie => !classifiedIds.has(movie.tmdbId));

      if (lastWinner && nextUnclassifiedMovie) {
        currentPair = [lastWinner, nextUnclassifiedMovie];
        const challengerIndex = allMovies.findIndex(m => m.tmdbId === nextUnclassifiedMovie.tmdbId);
        if (challengerIndex !== -1) {
          nextChallengers = allMovies.slice(challengerIndex + 1);
        }
      }
    }
  }

  // Effect 3: Preload images for the current pair and next few challengers.
  useEffect(() => {
    if (currentPair) {
      preloadImage(`${TASTE_IMAGE_BASE_URL}${currentPair[0].posterPath}`);
      preloadImage(`${TASTE_IMAGE_BASE_URL}${currentPair[1].posterPath}`);
    }
    nextChallengers.slice(0, 2).forEach(movie => {
      if (movie.posterPath) preloadImage(`${TASTE_IMAGE_BASE_URL}${movie.posterPath}`);
    });
  }, [currentPair, nextChallengers]);

  const classifyPreference = useCallback(async (winner: TasteMovie, loser: TasteMovie) => {
    const newPreference: TastePreferenceInfo = { preferred: winner, rejected: loser };
    const originalPreferences = tastePreferences;

    setTastePreferences(prev => [newPreference, ...prev]);

    if (user) {
      try {
        await addTastePreference(user.uid, winner.tmdbId, loser.tmdbId);
      } catch (error) {
        console.error("Failed to save taste preference, reverting optimistic update.", error);
        setTastePreferences(originalPreferences);
      }
    }
  }, [user, tastePreferences]);

  const value = {
    tastePreferences,
    isLoading: isLoading,
    classifyPreference,
    currentPair: currentPair,
    classifiedCount: tastePreferences.length,
    totalMoviesInGame: TASTE_GAME_MOVIE_IDS.length,
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
