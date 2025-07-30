
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getTrendingMovies } from './services/trendingMoviesService';
import type { TrendingMovie } from './types';

interface TrendingMoviesContextType {
  movies: TrendingMovie[];
  isLoading: boolean;
}

const TrendingMoviesContext = createContext<TrendingMoviesContextType | undefined>(undefined);

export const TrendingMoviesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<TrendingMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      const trendingMovies = await getTrendingMovies();
      setMovies(trendingMovies);
      setIsLoading(false);
    };
    fetchMovies();
  }, []);

  const value = { movies, isLoading };

  return (
    <TrendingMoviesContext.Provider value={value}>
      {children}
    </TrendingMoviesContext.Provider>
  );
};

export const useTrendingMovies = (): TrendingMoviesContextType => {
  const context = useContext(TrendingMoviesContext);
  if (context === undefined) {
    throw new Error('useTrendingMovies must be used within a TrendingMoviesProvider');
  }
  return context;
};
