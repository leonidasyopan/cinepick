import { GoogleGenAI, Type } from "@google/genai";
import type { TranslatedUserAnswers, MovieRecommendation, UserPreferences } from '../types';
import type { TastePreferenceInfo } from '../../taste/types';
import { fetchMovieDetailsFromTMDb } from './tmdbService';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The title of the movie." },
    year: { type: Type.INTEGER, description: "The release year of the movie." },
    justification: { type: Type.STRING, description: "A compelling, personalized, but concise (2-3 sentences) justification for why this movie fits the user's criteria. Weave the user's choices into the explanation." },
    streamingServices: {
      type: Type.ARRAY,
      description: "A list of 2-3 major streaming services where the movie is likely available (e.g., 'Netflix', 'Hulu', 'Prime Video', 'Disney+', 'Max'). This is a fallback.",
      items: { type: Type.STRING }
    },
    trailerSearchQuery: { type: Type.STRING, description: "A simple YouTube search query for the official trailer, e.g., 'Inception official trailer'." },
  },
  required: ["title", "year", "justification", "streamingServices", "trailerSearchQuery"]
};

const languageMap: Record<string, string> = {
  'en-us': 'English',
  'es-es': 'Spanish (from Spain)',
  'pt-br': 'Brazilian Portuguese'
};

export const getMovieRecommendation = async (
  answers: TranslatedUserAnswers,
  previousSuggestions: string[] = [],
  locale: string = 'en-us',
  preferences?: UserPreferences,
  tastePreferences?: TastePreferenceInfo[]
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

  let tastePreferencesText = '';
  if (tastePreferences && tastePreferences.length > 0) {
    const preferenceStrings = tastePreferences.map(p => `'${p.preferred.title}' over '${p.rejected.title}'`);
    tastePreferencesText = `\n- The user has shown a preference for these movies (preferred > rejected): ${preferenceStrings.join(', ')}. Use these strong taste indicators to find a similar style of movie that they will enjoy. This is very important.`;
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

        ${preferencesText ? `Additionally, the user has set the following hard constraints which you MUST follow:${preferencesText}` : ''}
        ${tastePreferencesText ? `Finally, the user has provided direct film taste preferences. You MUST take these into account:${tastePreferencesText}` : ''}

        Based on all these choices, provide one movie recommendation.
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
    const geminiRecommendation = JSON.parse(jsonText) as MovieRecommendation;

    if (!geminiRecommendation.title || !geminiRecommendation.justification) {
      throw new Error("Received incomplete data from API.");
    }

    // Enrich the recommendation with data from TMDb
    // `geminiRecommendation.title` is considered the original title
    const tmdbDetails = await fetchMovieDetailsFromTMDb(geminiRecommendation.title, geminiRecommendation.year, locale);

    // Combine Gemini's creative output with TMDb's factual data
    const fullRecommendation: MovieRecommendation = {
      ...geminiRecommendation,
      ...tmdbDetails,
    };

    // If TMDb providers are available, they are preferred.
    if (tmdbDetails.watchProviders && tmdbDetails.watchProviders.length > 0) {
      delete fullRecommendation.streamingServices;
    }

    return fullRecommendation;

  } catch (error) {
    console.error("Error fetching movie recommendation:", error);
    throw new Error("app.errorFetchingRecommendation");
  }
};