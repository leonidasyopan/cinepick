import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getTastePreferences, addTastePreference, getTasteProfile, saveTasteProfile, getFavoriteMovieIds, saveFavoriteMovieIds } from './services/tasteService';
import { generateTasteProfile, refineTasteProfile } from './services/tasteProfileService';
import { TASTE_GAME_MOVIE_IDS } from './constants';
import type { TasteMovie, TastePreferenceInfo } from './types';
import { preloadImage, TASTE_IMAGE_BASE_URL, fetchAllTasteMovies } from './services/tasteImageService';

interface TasteContextType {
  tastePreferences: TastePreferenceInfo[];
  isLoading: boolean;
  classifyPreference: (winner: TasteMovie, loser: TasteMovie) => Promise<void>;
  skipMovie: (movieToSkip: TasteMovie) => void;
  skipPair: () => void;
  currentPair: [TasteMovie, TasteMovie] | null;
  classifiedCount: number;
  totalMoviesInGame: number;
  // New properties for Taste Profile feature
  tasteProfile: string | null;
  isGameCompleted: boolean;
  isGeneratingProfile: boolean;
  generateAndSaveProfile: () => Promise<void>;
  refineAndSaveProfile: (justification: string) => Promise<void>;
  // Exported for displaying favorites
  favoriteIds: Set<number>;
  moviesById: Map<number, TasteMovie>;
}

const TasteContext = createContext<TasteContextType | undefined>(undefined);

export const TasteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tastePreferences, setTastePreferences] = useState<TastePreferenceInfo[]>([]);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [isFetchingUserPrefs, setIsFetchingUserPrefs] = useState(true);
  const [allMovies, setAllMovies] = useState<TasteMovie[]>([]);
  const [moviesById, setMoviesById] = useState<Map<number, TasteMovie>>(new Map());
  const [skippedIds, setSkippedIds] = useState<Set<number>>(new Set());

  // New state for Taste Profile
  const [tasteProfile, setTasteProfile] = useState<string | null>(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

  // New state for consecutive wins feature
  const [winStreaks, setWinStreaks] = useState<Map<number, number>>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Effect 1: Fetch all movie data from TMDb API on component mount.
  useEffect(() => {
    setIsFetchingInitialData(true);
    fetchAllTasteMovies(TASTE_GAME_MOVIE_IDS)
      .then(fetchedMovies => {
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
      const prefsPromise = getTastePreferences(user.uid)
        .then(prefsFromDb => {
          const detailedPrefs = prefsFromDb
            .map(p => ({
              preferred: moviesById.get(p.preferredId),
              rejected: moviesById.get(p.rejectedId),
            }))
            .filter(p => p.preferred && p.rejected) as TastePreferenceInfo[];
          setTastePreferences(detailedPrefs);
        });

      const profilePromise = getTasteProfile(user.uid).then(setTasteProfile);
      const favoritesPromise = getFavoriteMovieIds(user.uid).then(ids => setFavoriteIds(new Set(ids)));


      Promise.all([prefsPromise, profilePromise, favoritesPromise]).finally(() => setIsFetchingUserPrefs(false));
    } else {
      setTastePreferences([]);
      setTasteProfile(null);
      setFavoriteIds(new Set());
      setWinStreaks(new Map());
      setIsFetchingUserPrefs(false);
    }
  }, [user, allMovies.length, moviesById, isFetchingInitialData]);

  // --- Derived State Calculation ---
  const isLoading = isFetchingInitialData || isFetchingUserPrefs;
  const classifiedIds = new Set(tastePreferences.flatMap(p => [p.preferred.tmdbId, p.rejected.tmdbId]));

  const isLastWinnerRetired = tastePreferences.length > 0 && favoriteIds.has(tastePreferences[0].preferred.tmdbId);

  let currentPair: [TasteMovie, TasteMovie] | null = null;
  let nextChallengers: TasteMovie[] = [];

  if (!isLoading && allMovies.length > 0) {
    const availableMovies = allMovies.filter(m => !skippedIds.has(m.tmdbId) && !favoriteIds.has(m.tmdbId));

    if (tastePreferences.length === 0 || isLastWinnerRetired) {
      // Start a new tournament because it's the beginning or the last winner was just retired.
      const unclassifiedMovies = availableMovies.filter(m => !classifiedIds.has(m.tmdbId));
      if (unclassifiedMovies.length >= 2) {
        currentPair = [unclassifiedMovies[0], unclassifiedMovies[1]];
        nextChallengers = unclassifiedMovies.slice(2);
      }
    } else {
      // Continue "king of the hill" tournament.
      const lastWinner = tastePreferences[0].preferred;
      const nextUnclassifiedMovie = allMovies.find(movie =>
        movie.tmdbId !== lastWinner.tmdbId &&
        !classifiedIds.has(movie.tmdbId) &&
        !skippedIds.has(movie.tmdbId) &&
        !favoriteIds.has(movie.tmdbId)
      );

      if (lastWinner && nextUnclassifiedMovie) {
        currentPair = [lastWinner, nextUnclassifiedMovie];
        const challengerIndex = allMovies.findIndex(m => m.tmdbId === nextUnclassifiedMovie.tmdbId);
        if (challengerIndex !== -1) {
          nextChallengers = allMovies.slice(challengerIndex + 1).filter(m => !skippedIds.has(m.tmdbId) && !favoriteIds.has(m.tmdbId));
        }
      }
    }
  }

  const isGameCompleted = !isLoading && allMovies.length > 0 && currentPair === null && tastePreferences.length > 0;

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

    // Update win streaks
    const newWinStreaks = new Map(winStreaks);
    const currentStreak = newWinStreaks.get(winner.tmdbId) || 0;
    const newStreak = currentStreak + 1;
    newWinStreaks.set(winner.tmdbId, newStreak);
    newWinStreaks.set(loser.tmdbId, 0); // Reset loser's streak
    setWinStreaks(newWinStreaks);

    // Check for new favorite
    if (newStreak >= 4 && !favoriteIds.has(winner.tmdbId)) {
      const newFavorites = new Set(favoriteIds).add(winner.tmdbId);
      setFavoriteIds(newFavorites);
      if (user) {
        saveFavoriteMovieIds(user.uid, Array.from(newFavorites)).catch(err => {
          console.error("Failed to save favorites, reverting optimistic update.", err);
          setFavoriteIds(favoriteIds);
        });
      }
    }

    if (user) {
      try {
        await addTastePreference(user.uid, winner.tmdbId, loser.tmdbId);
      } catch (error) {
        console.error("Failed to save taste preference, reverting optimistic update.", error);
        setTastePreferences(originalPreferences);
      }
    }
  }, [user, tastePreferences, winStreaks, favoriteIds]);

  const skipMovie = useCallback((movieToSkip: TasteMovie) => {
    if (!movieToSkip) return;
    setSkippedIds(prev => new Set(prev).add(movieToSkip.tmdbId));
  }, []);

  const skipPair = useCallback(() => {
    if (!currentPair) return;
    setSkippedIds(prev => {
      const newSkipped = new Set(prev);
      newSkipped.add(currentPair[0].tmdbId);
      newSkipped.add(currentPair[1].tmdbId);
      return newSkipped;
    });
  }, [currentPair]);

  const generateAndSaveProfile = useCallback(async () => {
    if (!user || tastePreferences.length === 0) return;
    setIsGeneratingProfile(true);
    try {
      const newProfile = await generateTasteProfile(tastePreferences);
      await saveTasteProfile(user.uid, newProfile);
      setTasteProfile(newProfile);
    } catch (error) {
      console.error("Failed to generate and save profile", error);
    } finally {
      setIsGeneratingProfile(false);
    }
  }, [user, tastePreferences]);

  const refineAndSaveProfile = useCallback(async (justification: string) => {
    if (!user || !tasteProfile || tastePreferences.length === 0) return;
    setIsGeneratingProfile(true);
    try {
      const newProfile = await refineTasteProfile(tasteProfile, justification, tastePreferences);
      await saveTasteProfile(user.uid, newProfile);
      setTasteProfile(newProfile);
    } catch (error) {
      console.error("Failed to refine and save profile", error);
    } finally {
      setIsGeneratingProfile(false);
    }
  }, [user, tasteProfile, tastePreferences]);

  const value = {
    tastePreferences,
    isLoading: isLoading,
    classifyPreference,
    skipMovie,
    skipPair,
    currentPair: currentPair,
    classifiedCount: tastePreferences.length,
    totalMoviesInGame: TASTE_GAME_MOVIE_IDS.length,
    tasteProfile,
    isGameCompleted,
    isGeneratingProfile,
    generateAndSaveProfile,
    refineAndSaveProfile,
    favoriteIds,
    moviesById,
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
