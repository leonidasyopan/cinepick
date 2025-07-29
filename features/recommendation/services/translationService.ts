import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import firebaseApp from '../../../firebase';

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
  throw new Error('Failed to initialize AI services for translation. Please check your configuration.');
}

const languageMap: Record<string, string> = {
  'en-us': 'English',
  'es-es': 'Spanish (from Spain)',
  'pt-br': 'Brazilian Portuguese'
};

export const translateText = async (text: string, targetLocale: string): Promise<string> => {
  const languageName = languageMap[targetLocale] || 'English';

  const prompt = `
        You are an expert translator. Translate the following text into ${languageName}.
        The translation should be natural and fluent.
        IMPORTANT: Respond ONLY with the translated text, without any introductory phrases, explanations, or quotation marks around the text.
        
        Text to translate:
        "${text}"
    `;

  try {
    // Create a model instance with the desired model and configuration
    const model = getGenerativeModel(ai, {
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for more deterministic translation
      }
    });

    // Call the model with the prompt
    const result = await model.generateContent(prompt);

    const response = result.response;

    if (!response) {
      console.error("Translation API returned empty response.");
      return text; // Fallback to original text
    }

    return response.text().trim();
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Fallback to original text on error
  }
};
