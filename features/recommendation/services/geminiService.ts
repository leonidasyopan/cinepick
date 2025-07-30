
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";
import type { TranslatedUserAnswers, MovieRecommendation, UserPreferences } from '../types';

// Import the existing Firebase app instance
import firebaseApp from '../../../firebase';

// Import TMDb service for movie details enrichment
import { fetchMovieDetailsFromTMDb } from './tmdbService';

// Initialize Firebase AI with Gemini backend, with error handling for potential issues
let ai;
try {
    if (!firebaseApp) {
        console.warn('Firebase app is not initialized. Make sure environment variables are correctly set.');
        throw new Error('Firebase app initialization failed');
    }
    // Initialize with the Firebase app
    ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
} catch (error) {
    console.error('Error initializing AI:', error);
    // In a deployed app, this will prevent the app from working, but at least
    // it won't crash immediately and will show a meaningful error
    throw new Error('Failed to initialize AI services. Please check your configuration.');
}

// Schema definition for structured response using Schema class
const recommendationSchema = Schema.object({
    properties: {
        title: Schema.string({ description: "The title of the movie." }),
        year: Schema.integer({ description: "The release year of the movie." }),
        justifications: Schema.object({
            description: "A compelling, personalized, but concise (2-3 sentences) justification for why this movie fits the user's criteria, provided in multiple languages. Weave the user's choices into each explanation.",
            properties: {
                'en-us': Schema.string({ description: "The justification written in English (US)." }),
                'es-es': Schema.string({ description: "The justification written in Spanish (from Spain)." }),
                'pt-br': Schema.string({ description: "The justification written in Brazilian Portuguese." }),
            },
            required: ["en-us", "es-es", "pt-br"]
        }),
        streamingServices: Schema.array({
            description: "A list of 2-3 major streaming services where the movie is likely available (e.g., 'Netflix', 'Hulu', 'Prime Video', 'Disney+', 'Max'). This is a fallback.",
            items: Schema.string()
        }),
        trailerSearchQuery: Schema.string({ description: "A simple YouTube search query for the official trailer, e.g., 'Inception official trailer'." }),
    },
    required: ["title", "year", "justifications", "streamingServices", "trailerSearchQuery"]
});

export const getMovieRecommendation = async (
    answers: TranslatedUserAnswers,
    previousSuggestions: string[] = [],
    locale: string = 'en-us',
    preferences?: UserPreferences
): Promise<MovieRecommendation> => {

    const previousSuggestionsText = previousSuggestions.length > 0
        ? `Please do not suggest the following movies again: ${previousSuggestions.join(', ')}.`
        : '';
        
    let preferencesText = '';
    if (preferences?.startYear && preferences.startYear > 1900) {
        preferencesText += `\n- The movie must have been released in or after ${preferences.startYear}.`;
    }
    if (preferences?.ageRating && preferences.ageRating !== 'Any') {
        preferencesText += `\n- The movie's content rating (e.g., in the USA: G, PG, PG-13, R, NC-17) must be no stricter than ${preferences.ageRating}. For example, if 'PG-13' is specified, you can suggest 'G', 'PG', or 'PG-13' movies, but not 'R' or 'NC-17'.`;
    }

        const prompt = `
        You are 'CinePick', a friendly and expert movie recommendation assistant.
        A user has provided their preferences for a movie night. Your task is to suggest a single, perfect, and relatively well-known movie.
        The user's preferences are provided in their selected language.

        Here are the user's preferences:
        - Mood: They want to feel like ${answers.mood}.
        - Specific Vibe: They're looking for something ${answers.subMood}.
        - Occasion: It's for a '${answers.occasion}'.
        - Desired Themes: They chose these characteristics: ${answers.refinements.join(', ')}. Use these to narrow down the perfect genre and movie.

        ${preferencesText ? `Additionally, the user has set the following hard constraints which you MUST follow:${preferencesText}` : ''}

        Based on all these choices, provide one movie recommendation.
        ${previousSuggestionsText}
        
        Return the response in JSON format according to the provided schema. IMPORTANT: The 'justifications' object MUST contain the justification text translated into English (en-us), Spanish (es-es), and Brazilian Portuguese (pt-br).
    `;

    try {
        // Create a model instance with the desired model and structured output configuration
        const model = getGenerativeModel(ai, { 
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: recommendationSchema
            }
        });
        
        // Call the model with the prompt
        const result = await model.generateContent(prompt);
        
        const response = result.response;
        
        if (!response) {
            throw new Error("Received empty response from API");
        }
        
        // Parse the JSON from the response text
        const jsonText = response.text();
        const geminiRecommendation = JSON.parse(jsonText) as MovieRecommendation;

        if (!geminiRecommendation.title || !geminiRecommendation.justifications) {
            throw new Error("Received incomplete data from API.");
        }
        
        // Now, enrich the recommendation with data from TMDb
        const tmdbDetails = await fetchMovieDetailsFromTMDb(geminiRecommendation.title, geminiRecommendation.year, locale);
        
        // Combine Gemini's creative output with TMDb's factual data
        const fullRecommendation: MovieRecommendation = {
            ...geminiRecommendation,
            ...tmdbDetails,
        };
        
        // If TMDb providers are available, they are preferred.
        // Otherwise, we keep Gemini's fallback list.
        if (tmdbDetails.watchProviders && tmdbDetails.watchProviders.length > 0) {
            delete fullRecommendation.streamingServices;
        }

        return fullRecommendation;

    } catch (error) {
        console.error("Error fetching movie recommendation:", error);
        // Use a generic error message key, which will be translated in the component.
        throw new Error("app.errorFetchingRecommendation");
    }
};
