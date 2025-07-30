
import type { MovieRecommendation, WatchProvider } from '../../recommendation/types';
import { getProviderSearchLink } from '../../recommendation/services/providerLinkService';

// Check for both API key and access token
if (!import.meta.env.VITE_TMDB_API_KEY) {
  throw new Error("VITE_TMDB_API_KEY environment variable not set");
}

if (!import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN) {
  throw new Error("VITE_TMDB_READ_ACCESS_TOKEN environment variable not set");
}

// We now use the read access token for all API calls
const READ_ACCESS_TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// Helper function to format locale for TMDB API
const formatLocaleForTMDb = (locale: string): string => {
  const parts = locale.split('-');
  if (parts.length === 2) {
    return `${parts[0]}-${parts[1].toUpperCase()}`;
  }
  return 'en-US'; // fallback
};

interface TmdbMovieDetails {
  id: number;
  title: string;
  overview: string;
  runtime: number;
  vote_average: number;
  release_date: string;
  poster_path: string | null;
  credits: {
    cast: { name: string; order: number }[];
    crew: { name: string; job: string }[];
  };
  external_ids: {
    imdb_id: string;
  };
}

interface TmdbWatchProviderResult {
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: { provider_id: number, provider_name: string, logo_path: string }[];
      rent?: { provider_id: number, provider_name: string, logo_path: string }[];
      buy?: { provider_id: number, provider_name: string, logo_path: string }[];
      ads?: { provider_id: number, provider_name: string, logo_path: string }[];
    }
  }
}


const getMovieDetails = async (movieId: number, locale: string): Promise<Partial<MovieRecommendation>> => {
  const url = new URL(`${BASE_URL}/movie/${movieId}`);
  const tmdbLocale = formatLocaleForTMDb(locale);

  url.searchParams.append('append_to_response', 'credits,external_ids');
  url.searchParams.append('language', tmdbLocale);

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
      'accept': 'application/json'
    }
  };

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      // Throw an error with a specific message key for translation
      throw new Error('app.errorRevisitingRecommendation');
    }
    const data: TmdbMovieDetails = await response.json();

    const director = data.credits.crew.find(c => c.job === 'Director')?.name || 'N/A';
    const cast = data.credits.cast.slice(0, 4).map(c => c.name);

    return {
      title: data.title,
      posterPath: data.poster_path ?? undefined,
      synopsis: data.overview,
      runtime: data.runtime,
      rating: { score: data.vote_average, source: 'TMDb' },
      cast,
      director,
      imdbId: data.external_ids.imdb_id
    };
  } catch (error) {
    console.error("TMDb getMovieDetails for history failed:", error);
    // Re-throw the error so it can be caught by the calling function
    throw error;
  }
};

const getWatchProviders = async (movieId: number, locale: string, movieTitle: string): Promise<WatchProvider[]> => {
  const countryCode = locale.split('-')[1]?.toUpperCase() || 'US';
  const url = new URL(`${BASE_URL}/movie/${movieId}/watch/providers`);

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
      'accept': 'application/json'
    }
  };

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) return [];
    const data: TmdbWatchProviderResult = await response.json();

    const countryProviders = data.results[countryCode];
    if (!countryProviders) return [];

    const allProviderGroups = [
      ...(countryProviders.flatrate || []),
      ...(countryProviders.buy || []),
      ...(countryProviders.rent || []),
      ...(countryProviders.ads || []),
    ];

    if (allProviderGroups.length === 0) return [];

    const uniqueProviders = new Map<number, WatchProvider>();
    allProviderGroups.forEach(p => {
      if (!uniqueProviders.has(p.provider_id)) {
        const providerSearchLink = getProviderSearchLink(p.provider_name, movieTitle);
        const googleSearchFallback = `https://www.google.com/search?q=${encodeURIComponent(movieTitle)}+${encodeURIComponent(p.provider_name)}`;

        uniqueProviders.set(p.provider_id, {
          ...p,
          link: providerSearchLink || countryProviders.link || googleSearchFallback,
        });
      }
    });

    return Array.from(uniqueProviders.values());

  } catch (error) {
    console.error("TMDb getWatchProviders for history failed:", error);
    return []; // Return empty array on failure, not a critical error
  }
};

export const getMovieDetailsForHistory = async (tmdbId: number, originalTitle: string, newLocale: string): Promise<Partial<MovieRecommendation>> => {
  if (!tmdbId) {
    throw new Error('app.errorRevisitingRecommendation');
  }

  try {
    const [details, providers] = await Promise.all([
      getMovieDetails(tmdbId, newLocale),
      getWatchProviders(tmdbId, newLocale, originalTitle)
    ]);

    return {
      ...details,
      watchProviders: providers,
    };
  } catch (error) {
    // Log the error and re-throw it to be handled by the UI
    console.error(`Failed to get details for history item ${tmdbId}:`, error);
    throw error;
  }
};
