
import type { MovieRecommendation, WatchProvider } from '../types';

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

interface TmdbMovieSearchResult {
  id: number;
  title: string;
  release_date: string;
}

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
    }
  }
}

const searchMovie = async (title: string, year: number, locale: string): Promise<number | null> => {
  const url = new URL(`${BASE_URL}/search/movie`);
  const tmdbLocale = formatLocaleForTMDb(locale);

  url.searchParams.append('query', title);
  url.searchParams.append('language', tmdbLocale);
  if (year) {
    url.searchParams.append('year', year.toString());
  }

  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
      'accept': 'application/json'
    }
  };

  try {
    const response = await fetch(url.toString(), options);
    if (!response.ok) return null;
    const data = await response.json();
    const results: TmdbMovieSearchResult[] = data.results;

    // Find the best match, preferring exact title match
    const exactMatch = results.find(m => m.title.toLowerCase() === title.toLowerCase());
    if (exactMatch) return exactMatch.id;

    // Fallback to the first result if it exists
    return results.length > 0 ? results[0].id : null;
  } catch (error) {
    console.error("TMDb search failed:", error);
    return null;
  }
};

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
    if (!response.ok) return {};
    const data: TmdbMovieDetails = await response.json();

    const director = data.credits.crew.find(c => c.job === 'Director')?.name || 'N/A';
    const cast = data.credits.cast.slice(0, 4).map(c => c.name);

    return {
      posterPath: data.poster_path ?? undefined,
      synopsis: data.overview,
      runtime: data.runtime,
      rating: { score: data.vote_average, source: 'TMDb' },
      cast,
      director,
      imdbId: data.external_ids.imdb_id
    };
  } catch (error) {
    console.error("TMDb getMovieDetails failed:", error);
    return {};
  }
};

const getWatchProviders = async (movieId: number, locale: string): Promise<WatchProvider[]> => {
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
    if (!countryProviders || !countryProviders.flatrate) return [];

    return countryProviders.flatrate.map(p => ({
      ...p,
      link: countryProviders.link
    }));

  } catch (error) {
    console.error("TMDb getWatchProviders failed:", error);
    return [];
  }
};

export const fetchMovieDetailsFromTMDb = async (title: string, year: number, locale: string): Promise<Partial<MovieRecommendation>> => {
  const movieId = await searchMovie(title, year, locale);
  if (!movieId) {
    console.warn(`Movie "${title}" (${year}) not found on TMDb.`);
    return {};
  }

  const [details, providers] = await Promise.all([
    getMovieDetails(movieId, locale),
    getWatchProviders(movieId, locale)
  ]);

  return {
    ...details,
    watchProviders: providers
  };
};
