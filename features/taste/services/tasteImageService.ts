/**
 * The base URL for TMDb poster images. Using w500 for good quality and size.
 */
export const TASTE_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * A set to keep track of image URLs that have already been requested for preloading.
 * This prevents redundant network requests for the same image.
 */
const preloadedUrls = new Set<string>();

/**
 * Preloads a single image by creating an Image object in memory and setting its src.
 * This prompts the browser to fetch the image and store it in its cache, making
 * subsequent displays of the image instantaneous. It avoids redundant preloads.
 *
 * @param {string} url The full URL of the image to preload.
 */
export const preloadImage = (url: string): void => {
  // If the URL is invalid or has already been preloaded, do nothing.
  if (!url || preloadedUrls.has(url)) {
    return;
  }

  // Add the URL to the set to prevent future redundant preloads.
  preloadedUrls.add(url);

  // Create a new Image object. This is a lightweight way to trigger an HTTP request.
  const img = new Image();
  img.src = url;
};
