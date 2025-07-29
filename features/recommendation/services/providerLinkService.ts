// A map of keywords to search URL templates.
// The key is a lowercase keyword to find in the provider's name.
// The value is a template string where '{query}' will be replaced by the URL-encoded movie title.
const providerSearchLinks: Record<string, string> = {
  'netflix': 'https://www.netflix.com/search?q={query}',
  'prime video': 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase={query}&ie=UTF8',
  'disney+': 'https://www.disneyplus.com/search?q={query}',
  'hulu': 'https://www.hulu.com/search?q={query}',
  'max': 'https://play.max.com/search?q={query}',
  'apple tv': 'https://tv.apple.com/us/search?term={query}',
  'paramount+': 'https://www.paramountplus.com/search/?q={query}',
  'peacock': 'https://www.peacocktv.com/watch/search?q={query}',
  'youtube': 'https://www.youtube.com/results?search_query={query}+movie',
};

/**
* Constructs a search link for a specific streaming provider.
* @param providerName The name of the provider (e.g., "Netflix", "Amazon Prime Video").
* @param movieTitle The title of the movie to search for.
* @returns A fully formed search URL, or null if no template is found.
*/
export const getProviderSearchLink = (providerName: string, movieTitle: string): string | null => {
  const encodedTitle = encodeURIComponent(movieTitle);
  const lowerCaseProviderName = providerName.toLowerCase();

  // Find the first matching keyword in our map
  for (const keyword in providerSearchLinks) {
    if (lowerCaseProviderName.includes(keyword)) {
      const template = providerSearchLinks[keyword];
      return template.replace('{query}', encodedTitle);
    }
  }

  // If no specific provider is found, return null
  return null;
};
