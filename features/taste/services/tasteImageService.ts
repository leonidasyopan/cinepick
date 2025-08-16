
import type { TasteMovie } from '../types';

/**
 * The base URL for TMDb poster images. Using w500 for good quality and size.
 */
export const TASTE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500/';

/**
 * A set to keep track of image URLs that have already been requested for preloading.
 * This prevents redundant network requests for the same image.
 */
const preloadedUrls = new Set<string>();

/**
 * Preloads a single image by creating an Image object in memory and setting its src.
 * This prompts the browser to fetch the image and store it in its cache, making
 * subsequent displays of the image instantaneous. It avoids redundant preloads.
 *
 * @param {string} url The full URL of the image to preload.
 */
export const preloadImage = (url: string): void => {
  // If the URL is invalid or has already been preloaded, do nothing.
  if (!url || preloadedUrls.has(url)) {
    return;
  }

  // Add the URL to the set to prevent future redundant preloads.
  preloadedUrls.add(url);

  // Create a new Image object. This is a lightweight way to trigger an HTTP request.
  const img = new Image();
  img.src = url;
};


// --- New functionality to fetch movie data dynamically ---

const READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMTc4ZTA3NmVlZmNkZjE3ZmNhYzEwNGEwMTJjMzRiYSIsIm5iZiI6MTc0NzUwNjAxMC45NzQwMDAyLCJzdWIiOiI2ODI4ZDM1YTVhZjcwOGZlMDk5ZTJlMWYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qvIvXOmvYH_9iJ0-QvYa38IAu1tHzmxE03C6OlZ1z8c';
const BASE_URL = 'https://api.themoviedb.org/3';

interface TmdbMovieResponse {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string; // e.g., "2008-07-16"
  adult: boolean; // Added to check for adult content flag
  genre_ids?: number[]; // Added to check genres
}

/**
 * Fetches the full details for a list of movie IDs from the TMDb API.
 * This is used to ensure the taste game has the most up-to-date poster paths and titles.
 * @param {number[]} ids An array of TMDb movie IDs.
 * @returns A promise that resolves to an array of TasteMovie objects.
 */
export const fetchAllTasteMovies = async (ids: number[]): Promise<TasteMovie[]> => {
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
      'accept': 'application/json'
    }
  };

  const moviePromises = ids.map(id =>
    fetch(`${BASE_URL}/movie/${id}?language=en-US`, options)
      .then(res => {
        if (!res.ok) {
          console.error(`Failed to fetch movie with ID ${id}: ${res.statusText}`);
          return null; // Return null for failed requests
        }
        return res.json() as Promise<TmdbMovieResponse>;
      })
  );

  try {
    const results = await Promise.all(moviePromises);

    // Added safety filters to prevent inappropriate content
    return results
      .filter((movie): movie is TmdbMovieResponse => {
        // Filter out null responses
        if (movie === null) return false;
        
        // Filter out movies without posters
        if (!movie.poster_path) return false;
        
        // Filter out any movie flagged as adult content
        if (movie.adult === true) {
          console.warn(`Filtered out adult content: ${movie.title} (ID: ${movie.id})`);
          return false;
        }
        
        // Additional safety: Filter out movies with suspicious titles
        const suspiciousTerms = ['xxx', 'porn', 'adult', 'sex', 'erotic', 'fantastics'];
        const lowercaseTitle = movie.title.toLowerCase();
        if (suspiciousTerms.some(term => lowercaseTitle.includes(term))) {
          console.warn(`Filtered out potentially inappropriate content: ${movie.title} (ID: ${movie.id})`);
          return false;
        }
        
        return true;
      })
      .map(movie => ({
        tmdbId: movie.id,
        title: movie.title,
        // The API returns poster paths with a leading slash, which we remove for consistency.
        posterPath: movie.poster_path!.startsWith('/') ? movie.poster_path!.substring(1) : movie.poster_path!,
        year: movie.release_date ? parseInt(movie.release_date.substring(0, 4), 10) : 0,
      }));
  } catch (error) {
    console.error('An error occurred while fetching taste movies:', error);
    return [];
  }
};
