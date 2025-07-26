
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";
import type { TranslatedUserAnswers, MovieRecommendation } from '../types';

// Import the existing Firebase app instance
import firebaseApp from '../../../firebase';

// Import TMDb service for movie details enrichment
import { fetchMovieDetailsFromTMDb } from './tmdbService';

// Initialize Firebase AI with Gemini backend
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

// Schema definition for structured response using Schema class
const recommendationSchema = Schema.object({
    properties: {
        title: Schema.string({ description: "The title of the movie." }),
        year: Schema.integer({ description: "The release year of the movie." }),
        justification: Schema.string({ description: "A compelling, personalized justification explaining why this movie fits the user's criteria. Weave the user's choices into the explanation." }),
        streamingServices: Schema.array({
            description: "A list of 2-3 major streaming services where the movie is likely available (e.g., 'Netflix', 'Hulu', 'Prime Video', 'Disney+', 'Max').",
            items: Schema.string()
        }),
        trailerSearchQuery: Schema.string({ description: "A simple YouTube search query for the official trailer, e.g., 'Inception official trailer'." }),
    },
    required: ["title", "year", "justification", "streamingServices", "trailerSearchQuery"]
});

export const getMovieRecommendation = async (
    answers: TranslatedUserAnswers,
    previousSuggestions: string[] = [],
    locale: string = 'en-us'
): Promise<MovieRecommendation> => {

    const previousSuggestionsText = previousSuggestions.length > 0
        ? `Please do not suggest the following movies again: ${previousSuggestions.join(', ')}.`
        : '';

    const languageMap: Record<string, string> = {
        'en-us': 'English',
        'es-es': 'Spanish (Spain)',
        'pt-br': 'Brazilian Portuguese'
    }
    const languageName = languageMap[locale] || 'English';

    const prompt = `
        You are 'CinePick', a friendly and expert movie recommendation assistant.
        A user has provided their preferences for a movie night. Your task is to suggest a single, perfect, and relatively well-known movie.
        Your entire response, especially the 'justification', MUST be in the following language: ${languageName}.

        Here are the user's preferences, also in ${languageName}:
        - Mood: They want to feel like ${answers.mood}.
        - Specific Vibe: They're looking for something ${answers.subMood}.
        - Occasion: It's for a '${answers.occasion}'.
        - Desired Themes: They chose these characteristics: ${answers.refinements.join(', ')}. Use these to narrow down the perfect genre and movie.

        Based on these choices, provide one movie recommendation.
        ${previousSuggestionsText}
        
        Return the response in JSON format according to the provided schema. The 'justification' field must be in ${languageName}.
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

        if (!geminiRecommendation.title || !geminiRecommendation.justification) {
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
