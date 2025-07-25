
import { GoogleGenAI, Type } from "@google/genai";
import type { TranslatedUserAnswers, MovieRecommendation } from '../types';

if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The title of the movie." },
        year: { type: Type.INTEGER, description: "The release year of the movie." },
        justification: { type: Type.STRING, description: "A compelling, personalized justification explaining why this movie fits the user's criteria. Weave the user's choices into the explanation." },
        streamingServices: {
            type: Type.ARRAY,
            description: "A list of 2-3 major streaming services where the movie is likely available (e.g., 'Netflix', 'Hulu', 'Prime Video', 'Disney+', 'Max').",
            items: { type: Type.STRING }
        },
        trailerSearchQuery: { type: Type.STRING, description: "A simple YouTube search query for the official trailer, e.g., 'Inception official trailer'." },
    },
    required: ["title", "year", "justification", "streamingServices", "trailerSearchQuery"]
};

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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
                temperature: 0.8,
            },
        });

        if (!response.text) {
            throw new Error("Received empty response from API");
        }

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (!parsedJson.title || !parsedJson.justification) {
            throw new Error("Received incomplete data from API.");
        }

        return parsedJson as MovieRecommendation;

    } catch (error) {
        console.error("Error fetching movie recommendation:", error);
        // Use a generic error message key, which will be translated in the component.
        throw new Error("app.errorFetchingRecommendation");
    }
};
