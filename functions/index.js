const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Pre-load the HTML template from the filesystem.
// In a deployed environment, the function's root is the 'functions' directory,
// so we go up one level to find the 'dist' directory where index.html is.
const indexHtmlPath = path.join(__dirname, "..", "dist", "index.html");
let indexHtml = "";
try {
  indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
} catch (error) {
  console.error("Failed to read index.html from filesystem:", error);
  // If reading fails on startup, the function won't work correctly.
  // This could happen if the file path is wrong or permissions are denied.
}

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
 * Cloud Function to render share pages with dynamic Open Graph meta tags.
 */
exports.renderSharePage = functions.https.onRequest(async (req, res) => {
  // If the index.html template wasn't loaded at startup, we can't proceed.
  if (!indexHtml) {
    res.status(500).send("Server configuration error: HTML template not found.");
    return;
  }

  // Only handle GET requests for this function.
  if (req.method !== "GET") {
    res.status(403).send("Forbidden!");
    return;
  }

  const userAgent = req.headers["user-agent"];

  if (isBot(userAgent)) {
    // It's a bot, so we need to generate dynamic meta tags.
    const pathParts = req.path.split("/"); // e.g., ["", "share", "someId"]
    const recommendationId = pathParts[2];

    if (!recommendationId) {
      // If no ID is provided, serve the default HTML.
      res.status(200).send(indexHtml);
      return;
    }

    try {
      const docRef = db.collection("sharedRecommendations").doc(recommendationId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        const { recommendation } = data;
        const { title, justification, posterPath } = recommendation;

        const imageUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

        // Replace placeholders in the HTML template
        const finalHtml = indexHtml
          .replace(/__OG_TITLE__/g, title)
          .replace(/__OG_DESCRIPTION__/g, justification)
          .replace(/__OG_IMAGE__/g, imageUrl);

        res.set("Cache-Control", "public, max-age=600, s-maxage=1200");
        res.status(200).send(finalHtml);
      } else {
        // Recommendation not found, serve default HTML so the link still works
        // for users and shows a "not found" message on the client.
        res.status(404).send(indexHtml);
      }
    } catch (error) {
      console.error("Error fetching from Firestore or generating HTML:", error);
      // Serve default HTML as a fallback on error.
      res.status(500).send(indexHtml);
    }
  } else {
    // It's a regular user, not a bot. Serve the original index.html.
    // The client-side React app will handle the routing and display the page.
    res.set("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(200).send(indexHtml);
  }
});
