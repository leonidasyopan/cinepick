/*
import { GoogleGenAI, Type } from "@google/genai";
import type { UserAnswers, MovieRecommendation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        trailerSearchQuery: { type: Type.STRING, description: "A simple YouTube search query for the official trailer, e.g., 'Inception official trailer'."},
    },
    required: ["title", "year", "justification", "streamingServices", "trailerSearchQuery"]
};

export const getMovieRecommendation = async (
    answers: UserAnswers,
    previousSuggestions: string[] = []
): Promise<MovieRecommendation> => {
    
    const previousSuggestionsText = previousSuggestions.length > 0 
        ? `Please do not suggest the following movies again: ${previousSuggestions.join(', ')}.`
        : '';

    const prompt = `
        You are 'CinePick', a friendly and expert movie recommendation assistant.
        A user has provided their preferences for a movie night. Your task is to suggest a single, perfect, and relatively well-known movie.

        User's Preferences:
        - Mood: I want to feel like ${answers.mood}.
        - Specific Vibe: I'm looking for something ${answers.subMood}.
        - Occasion: It's for a '${answers.occasion}'.
        - Desired Genre: I'm craving ${answers.genre}. If the user has no preference, feel free to choose the best genre that fits the other criteria.

        Based on these choices, provide one movie recommendation.
        ${previousSuggestionsText}
        
        Return the response in JSON format according to the provided schema.
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
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        // Basic validation
        if (!parsedJson.title || !parsedJson.justification) {
            throw new Error("Received incomplete data from API.");
        }
        
        return parsedJson as MovieRecommendation;

    } catch (error) {
        console.error("Error fetching movie recommendation:", error);
        throw new Error("Sorry, I couldn't think of a movie right now. Please try again.");
    }
};
*/