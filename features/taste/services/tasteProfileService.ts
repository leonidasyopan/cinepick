import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import type { TastePreferenceInfo } from '../types';
import firebaseApp from '../../../firebase';

// Initialize Firebase AI with Gemini backend
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
  throw new Error('Failed to initialize AI services for taste profile. Please check your configuration.');
}


const formatPreferencesForPrompt = (preferences: TastePreferenceInfo[]): string => {
  if (!preferences || preferences.length === 0) return 'No preferences provided.';
  return preferences
    .map(p => `- Preferred: "${p.preferred.title}" over "${p.rejected.title}"`)
    .join('\n');
};

export const generateTasteProfile = async (preferences: TastePreferenceInfo[]): Promise<string> => {
  const formattedPrefs = formatPreferencesForPrompt(preferences);

  const prompt = `
        You are 'CinePick', a witty and insightful film critic AI. A user has completed a 'this or that' game with movies.
        Based on their choices below (where 'preferred' was chosen over 'rejected'), write a short, engaging, 2-paragraph analysis of their cinematic taste.
        Be specific about genres, themes, or tones they might enjoy. Address the user directly in a friendly tone. For example: 'You seem to have a taste for...'.

        User's choices:
        ${formattedPrefs}
    `;

  try {
    // Create a model instance with the desired model and configuration
    const model = getGenerativeModel(ai, {
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
      }
    });
    
    // Call the model with the prompt
    const result = await model.generateContent(prompt);
    
    const response = result.response;
    
    if (!response) {
      throw new Error("Received empty response from profile generation API");
    }
    return response.text().trim();
  } catch (error) {
    console.error("Error generating taste profile:", error);
    throw new Error("Failed to generate taste profile.");
  }
};

export const refineTasteProfile = async (originalProfile: string, userJustification: string, preferences: TastePreferenceInfo[]): Promise<string> => {
  const formattedPrefs = formatPreferencesForPrompt(preferences);
  const prompt = `
        You are 'CinePick', an AI film critic helping a user refine their taste profile.

        Here is the profile you previously generated:
        \`\`\`
        ${originalProfile}
        \`\`\`

        The user disagreed and provided this feedback:
        \`\`\`
        ${userJustification}
        \`\`\`

        Here are the user's original movie choices for your reference:
        \`\`\`
        ${formattedPrefs}
        \`\`\`

        Please generate a new, updated 2-paragraph profile that incorporates their feedback. Acknowledge their input subtly without explicitly saying 'you said'.
        Respond with only the new profile text, without any surrounding markdown or introductory phrases.
    `;

  try {
    // Create a model instance with the desired model and configuration
    const model = getGenerativeModel(ai, {
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
      }
    });
    
    // Call the model with the prompt
    const result = await model.generateContent(prompt);
    
    const response = result.response;
    
    if (!response) {
      throw new Error("Received empty response from profile refinement API");
    }
    return response.text().trim();
  } catch (error) {
    console.error("Error refining taste profile:", error);
    throw new Error("Failed to refine taste profile.");
  }
};
