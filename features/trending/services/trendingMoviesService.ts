
import type { TrendingMovie } from '../types';

const READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMTc4ZTA3NmVlZmNkZjE3ZmNhYzEwNGEwMTJjMzRiYSIsIm5iZiI6MTc0NzUwNjAxMC45NzQwMDAyLCJzdWIiOiI2ODI4ZDM1YTVhZjcwOGZlMDk5ZTJlMWYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.qvIvXOmvYH_9iJ0-QvYa38IAu1tHzmxE03C6OlZ1z8c';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

interface TmdbTrendingResult {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
}

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
    const url = new URL(`${BASE_URL}/trending/movie/week`);
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
            throw new Error(`TMDb trending fetch failed with status ${response.status}`);
        }
        const data = await response.json();
        const results: TmdbTrendingResult[] = data.results || [];

        return results
            .filter(movie => movie.poster_path) // Ensure movie has a poster
            .map(movie => ({
                id: movie.id,
                title: movie.title,
                posterPath: `${IMAGE_BASE_URL}w500${movie.poster_path}`,
                rating: movie.vote_average,
            }));
    } catch (error) {
        console.error("Failed to fetch trending movies:", error);
        return [];
    }
}
