import type { WatchProvider } from '../types';

// Provider IDs are based on TMDB provider IDs
// See: https://developers.themoviedb.org/3/watch-providers/get-movie-providers

interface StreamingUrlPattern {
  // Function to generate a direct URL based on movie details
  generateUrl: (
    provider: WatchProvider, 
    title: string, 
    year?: number, 
    imdbId?: string, 
    tmdbId?: number
  ) => string;
  // Priority: lower numbers are preferred when multiple methods are available
  priority: number;
}

interface StreamingUrlMappings {
  [providerId: number]: StreamingUrlPattern;
  [providerName: string]: StreamingUrlPattern;
}

/**
 * Map of streaming provider IDs and names to URL patterns
 * Each provider can have multiple methods to generate URLs with different priorities
 */
export const streamingUrlMappings: StreamingUrlMappings = {
  // Netflix - Provider ID: 8
  8: {
    generateUrl: (_provider, title) => {
      // Netflix doesn't support direct deep linking to movies
      // Best we can do is a search URL
      return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "Netflix": {
    generateUrl: (_provider, title) => {
      return `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  // Amazon Prime Video - Provider ID: 9
  9: {
    generateUrl: (_provider, title, _year, imdbId) => {
      // If we have IMDb ID, use it for more accurate results
      if (imdbId) {
        return `https://www.amazon.com/gp/video/detail/${imdbId}`;
      }
      // Otherwise, fall back to search
      return `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`;
    },
    priority: 1
  },
  "Amazon Prime Video": {
    generateUrl: (_provider, title, _year, imdbId) => {
      if (imdbId) {
        return `https://www.amazon.com/gp/video/detail/${imdbId}`;
      }
      return `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`;
    },
    priority: 1
  },
  "Prime Video": {
    generateUrl: (_provider, title, _year, imdbId) => {
      if (imdbId) {
        return `https://www.amazon.com/gp/video/detail/${imdbId}`;
      }
      return `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`;
    },
    priority: 1
  },
  "Amazon Video": {
    generateUrl: (_provider, title, _year, imdbId) => {
      if (imdbId) {
        return `https://www.amazon.com/gp/video/detail/${imdbId}`;
      }
      return `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`;
    },
    priority: 1
  },

  // Disney+ - Provider ID: 337
  337: {
    generateUrl: (_provider, title, _year, _imdbId, tmdbId) => {
      // Disney+ works better with their content page than direct search
      // Format the title for use in URL slugs
      const slugifiedTitle = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .trim();
      
      // For English language content
      if (tmdbId) {
        return `https://www.disneyplus.com/movies/${slugifiedTitle}/${tmdbId}`;
      }
      
      return `https://www.disneyplus.com/movies/${slugifiedTitle}`;
    },
    priority: 1
  },
  "Disney+": {
    generateUrl: (_provider, title, _year, _imdbId, tmdbId) => {
      const slugifiedTitle = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') 
        .replace(/\s+/g, '-')     
        .trim();
      
      if (tmdbId) {
        return `https://www.disneyplus.com/movies/${slugifiedTitle}/${tmdbId}`;
      }
      
      return `https://www.disneyplus.com/movies/${slugifiedTitle}`;
    },
    priority: 1
  },
  "Disney Plus": {
    generateUrl: (_provider, title, _year, _imdbId, tmdbId) => {
      const slugifiedTitle = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') 
        .replace(/\s+/g, '-')     
        .trim();
      
      if (tmdbId) {
        return `https://www.disneyplus.com/movies/${slugifiedTitle}/${tmdbId}`;
      }
      
      return `https://www.disneyplus.com/movies/${slugifiedTitle}`;
    },
    priority: 1
  },

  // Hulu - Provider ID: 15
  15: {
    generateUrl: (_provider, title) => {
      return `https://www.hulu.com/search?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "Hulu": {
    generateUrl: (_provider, title) => {
      return `https://www.hulu.com/search?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  // Max (formerly HBO Max) - Provider ID: 384
  384: {
    generateUrl: (_provider, title) => {
      return `https://www.max.com/search?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "Max": {
    generateUrl: (_provider, title) => {
      return `https://www.max.com/search?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  // Apple TV+ - Provider ID: 350
  350: {
    generateUrl: (_provider, title) => {
      return `https://tv.apple.com/search?term=${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "Apple TV+": {
    generateUrl: (_provider, title) => {
      return `https://tv.apple.com/search?term=${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  // Globoplay - Provider ID: 307 (for Brazil)
  307: {
    generateUrl: (_provider, title) => {
      return `https://globoplay.globo.com/busca/?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "Globoplay": {
    generateUrl: (_provider, title) => {
      return `https://globoplay.globo.com/busca/?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  // Paramount+ - Provider ID: 531
  531: {
    generateUrl: (_provider, title) => {
      return `https://www.paramountplus.com/search/?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "Paramount+": {
    generateUrl: (_provider, title) => {
      return `https://www.paramountplus.com/search/?q=${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  // Generic fallback for any provider not explicitly mapped
  // fuboTV - Provider ID: 257
  257: {
    generateUrl: (_provider, title) => {
      // fuboTV uses a search interface
      return `https://www.fubo.tv/search/${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "fuboTV": {
    generateUrl: (_provider, title) => {
      return `https://www.fubo.tv/search/${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  // YouTube TV - Provider ID: 2528
  2528: {
    generateUrl: (_provider, title) => {
      // YouTube TV uses a search interface
      return `https://tv.youtube.com/search/${encodeURIComponent(title)}`;
    },
    priority: 1
  },
  "Youtube TV": {
    generateUrl: (_provider, title) => {
      return `https://tv.youtube.com/search/${encodeURIComponent(title)}`;
    },
    priority: 1
  },

  "default": {
    generateUrl: (provider) => {
      // Return the TMDB JustWatch page as fallback
      return provider.link || '';
    },
    priority: 99
  }
};

/**
 * Generate a direct URL to a movie on a streaming platform
 * 
 * @param provider The watch provider data from TMDB
 * @param title The movie title
 * @param year The movie release year
 * @param imdbId The IMDb ID if available
 * @param tmdbId The TMDB ID if available
 * @returns A direct URL to the movie on the streaming platform
 */
export const generateStreamingUrl = (
  provider: WatchProvider,
  title: string,
  year?: number,
  imdbId?: string,
  tmdbId?: number
): string => {
  console.log('Generating streaming URL for provider:', JSON.stringify(provider));
  
  // Try to find a mapping by provider ID first
  let urlPattern = streamingUrlMappings[provider.provider_id];
  
  // If no mapping by ID, try by exact name
  if (!urlPattern) {
    urlPattern = streamingUrlMappings[provider.provider_name];
    console.log('Looking for exact name match:', provider.provider_name, urlPattern ? 'found' : 'not found');
  }
  
  // If still no mapping, try case-insensitive name matching
  if (!urlPattern) {
    // Try to find a case-insensitive match among our supported providers
    const providerNameLower = provider.provider_name.toLowerCase();
    const possibleMatches = Object.keys(streamingUrlMappings).filter(key => {
      if (typeof key === 'string' && isNaN(Number(key))) {
        return key.toLowerCase().includes(providerNameLower) || 
               providerNameLower.includes(key.toLowerCase());
      }
      return false;
    });
    
    if (possibleMatches.length > 0) {
      console.log('Found fuzzy matches for provider:', possibleMatches);
      urlPattern = streamingUrlMappings[possibleMatches[0]];
    }
  }
  
  // Special case for Prime Video / Amazon variations
  if (!urlPattern && provider.provider_name.toLowerCase().includes('prime') || 
      provider.provider_name.toLowerCase().includes('amazon')) {
    console.log('Using Amazon Prime fallback for:', provider.provider_name);
    urlPattern = streamingUrlMappings['Prime Video'];
  }
  
  // If still no mapping, use the default
  if (!urlPattern) {
    console.log('No mapping found for provider, using default:', provider.provider_name);
    urlPattern = streamingUrlMappings["default"];
  }
  
  // Generate the URL using the pattern
  const url = urlPattern.generateUrl(provider, title, year, imdbId, tmdbId);
  console.log('Generated URL:', url);
  return url;
};
