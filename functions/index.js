

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// The base URL of the live site, used to fetch the HTML template.
const HOSTING_URL = "https://cinepick-app.web.app";

// Fallback CTA map.
const CTA_BY_LOCALE = {
  "en-us": "Find Your Own Perfect Movie!",
  "es-es": "¡Encuentra Tu Propia Película Perfecta!",
  "pt-br": "Encontre Seu Próprio Filme Perfeito!",
};

// Templates for the new, personalized social media preview description.
const PREVIEW_TEMPLATES = {
  "en-us": (name, submood, movie) => `${name} was looking for a "${submood.toLowerCase()}" movie and CinePick recommended: ${movie}. See why it's the perfect pick!`,
  "es-es": (name, submood, movie) => `${name} buscaba una película de "${submood.toLowerCase()}" y CinePick le recomendó: ${movie}. ¡Descubre por qué es la elección perfecta!`,
  "pt-br": (name, submood, movie) => `${name} estava procurando um filme sobre "${submood.toLowerCase()}" e o CinePick recomendou: ${movie}. Veja por que é a escolha perfeita!`,
};


admin.initializeApp();
const db = admin.firestore();

/**
 * Checks if the User-Agent string belongs to a known social media crawler.
 * @param {string} userAgent The User-Agent string from the request headers.
 * @return {boolean} True if it's a known bot, false otherwise.
 */
const isBot = (userAgent) => {
  if (!userAgent) {
    return false;
  }
  // List of common social media crawler user agents
  const bots = [
    "twitterbot",
    "facebookexternalhit",
    "linkedinbot",
    "slackbot",
    "discordbot",
    "pinterest",
    "whatsapp",
  ];
  const lowerCaseUserAgent = userAgent.toLowerCase();
  return bots.some((bot) => lowerCaseUserAgent.includes(bot));
};

/**
 * Helper to escape characters in a string to be safely used in HTML attributes.
 * @param {string} unsafe The string to escape.
 * @return {string} The escaped string.
 */
function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") {
    return "";
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Cloud Function to render share pages with dynamic Open Graph meta tags.
 */
exports.renderSharePage = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(403).send("Forbidden!");
  }

  // Fetch the latest index.html from the live site on every request.
  let indexHtml;
  try {
    const response = await fetch(`${HOSTING_URL}/index.html`);
    if (!response.ok) {
      throw new Error(`Failed to fetch index.html: ${response.status}`);
    }
    indexHtml = await response.text();
  } catch (error) {
    console.error("Critical error: Could not fetch HTML template.", error);
    return res.status(500).send("Server configuration error: Could not fetch HTML template.");
  }

  const userAgent = req.headers["user-agent"];

  if (isBot(userAgent)) {
    const pathParts = req.path.split("/"); // e.g., ["", "share", "someId"]
    const recommendationId = pathParts[2];

    if (!recommendationId) {
      // No ID, serve default (unmodified) HTML.
      return res.status(200).send(indexHtml);
    }

    try {
      const docSnap = await db.collection("sharedRecommendations").doc(recommendationId).get();

      if (docSnap.exists) {
        const data = docSnap.data();

        if (!data || !data.recommendation) {
          console.warn(`Firestore document ${recommendationId} is missing or has malformed data.`, data);
          return res.status(404).send(indexHtml); // Send default HTML
        }

        const { recommendation, locale, sharerName, translatedSubMood } = data;
        const { title, justification, posterPath } = recommendation;

        const finalTitle = title || "CinePick Recommendation";
        let finalDescription;

        const templateFn = PREVIEW_TEMPLATES[locale] || PREVIEW_TEMPLATES["en-us"];

        // Use new personalized description if all data is available
        if (sharerName && translatedSubMood && title) {
          finalDescription = templateFn(sharerName, translatedSubMood, title);
        } else {
          // Fallback to old justification + CTA model
          const fallbackCta = CTA_BY_LOCALE[locale] || CTA_BY_LOCALE["en-us"];
          finalDescription = `${justification || "A movie recommendation from a friend."} ${fallbackCta}`;
        }

        console.log(`[renderSharePage] ID: ${recommendationId}, Title: ${finalTitle}, Description: ${finalDescription}`);

        const imageUrl = posterPath ?
          `https://image.tmdb.org/t/p/w500${posterPath}` :
          `${HOSTING_URL}/apple-touch-icon.png`;

        // Replace placeholders in the HTML template with escaped, final values.
        const finalHtml = indexHtml
          .replace(/<title>.*<\/title>/, `<title>${escapeHtml(finalTitle)}</title>`)
          .replace(/<meta property="og:title" content=".*">/, `<meta property="og:title" content="${escapeHtml(finalTitle)}">`)
          .replace(/<meta property="og:description" content=".*">/, `<meta property="og:description" content="${escapeHtml(finalDescription)}">`)
          .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${escapeHtml(finalDescription)}">`)
          .replace(/<meta property="og:image" content=".*">/, `<meta property="og:image" content="${escapeHtml(imageUrl)}">`);

        res.set("Cache-Control", "public, max-age=600, s-maxage=1200");
        return res.status(200).send(finalHtml);
      } else {
        // Doc not found, send default HTML. Client-side will show "not found" page.
        console.warn(`[renderSharePage] Recommendation ID not found in Firestore: ${recommendationId}`);
        return res.status(404).send(indexHtml);
      }
    } catch (error) {
      console.error(`[renderSharePage] Error processing recommendationId ${recommendationId}:`, error);
      // Fallback to serving default HTML on any processing error.
      return res.status(500).send(indexHtml);
    }
  } else {
    // It's a regular user, serve the original index.html.
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    return res.status(200).send(indexHtml);
  }
});