import React, { useEffect, useState, useRef } from 'react';
import { WatchProvider } from '../types';
import { IMAGE_BASE_URL, fetchStreamingProviders } from '../services/tmdbService';
import { NetflixIcon, HuluIcon, PrimeVideoIcon, DisneyPlusIcon, MaxIcon, AppleTVIcon, GenericStreamIcon } from '../../../components/icons/index';
import { useI18n } from '../../../src/i18n/i18n';
// No longer need generateStreamingUrl as we're using fetchStreamingProviders directly

interface StreamingProvidersProps {
  watchProviders?: WatchProvider[];
  streamingServices?: string[];
  title: string;
  year: number;
  imdbId?: string;
  tmdbId?: number;
  className?: string;
}

/**
 * A component that displays streaming provider logos with direct links
 * Handles async loading of enhanced streaming links
 */
export const StreamingProviders: React.FC<StreamingProvidersProps> = ({ 
  watchProviders = [], 
  streamingServices = [],
  title,
  year,
  imdbId,
  tmdbId,
  className = ''
}) => {
  const { t } = useI18n();
  // Use refs to track whether we've already shown providers or are fetching
  const [displayedProviders, setDisplayedProviders] = useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(watchProviders.length === 0);
  const hasFetchedRef = useRef(false);
  const initialProvidersShownRef = useRef(false);
  
  useEffect(() => {
    // If we already have stable providers with direct links, don't reload
    if (hasFetchedRef.current) return;
    
    const loadProviders = async () => {
      // If we don't have any initial providers, show loading state
      if (watchProviders.length === 0) {
        setIsLoading(true);
      }
      // Use initial providers if available (only once)
      else if (!initialProvidersShownRef.current) {
        initialProvidersShownRef.current = true;
        setDisplayedProviders(watchProviders);
        setIsLoading(false);
      }
      
      // Only fetch fresh data if we have a tmdbId
      if (tmdbId) {
        try {
          // Make API call - this won't cause state updates until complete
          const freshProviders = await fetchStreamingProviders(
            tmdbId,
            title,
            year,
            'en-US',
            imdbId
          );
          
          // Only update state if we got better data
          if (freshProviders && freshProviders.length > 0) {
            hasFetchedRef.current = true; // Mark as having fetched final data
            setDisplayedProviders(freshProviders);
          } 
          // If we got no providers but had initial ones, keep showing those
          else if (watchProviders.length > 0) {
            hasFetchedRef.current = true;
          } else {
            // No providers from either source - mark as fetched to prevent endless loading
            hasFetchedRef.current = true;
          }
          
          // Always turn off loading when fetch completes
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching streaming providers:', error);
          // If fetch fails but we have initial providers, keep showing those
          if (watchProviders.length > 0) {
            setDisplayedProviders(watchProviders);
          }
          hasFetchedRef.current = true; // Always mark as fetched on error to prevent retries
          // Always turn off loading even on error
          setIsLoading(false);
        }
      }
    };
    
    loadProviders();
  }, [tmdbId]); // Only dependent on tmdbId - other props shouldn't trigger refetching
  
  // Helper function to get the appropriate icon for a streaming service
  const getStreamingIcon = (serviceName: string) => {
    const s = serviceName.toLowerCase();
    if (s.includes('netflix')) return <NetflixIcon />;
    if (s.includes('hulu')) return <HuluIcon />;
    if (s.includes('prime video') || s.includes('amazon')) return <PrimeVideoIcon />;
    if (s.includes('disney+')) return <DisneyPlusIcon />;
    if (s.includes('max')) return <MaxIcon />;
    if (s.includes('apple tv')) return <AppleTVIcon />;
    return <GenericStreamIcon />;
  };
  
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-bold mb-3 text-text-primary">{t('recommendationScreen.watchOn')}</h3>
        <div className="flex items-center justify-center lg:justify-start gap-3">
          {/* Loading placeholders */}
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-surface/50 rounded-md animate-pulse"></div>
              <div className="w-16 h-3 bg-surface/50 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-bold mb-3 text-text-primary">{t('recommendationScreen.watchOn')}</h3>
      <div className="flex items-center justify-center lg:justify-start gap-3">
        {displayedProviders.length > 0 ? (
          // Show providers from TMDB if available
          displayedProviders.slice(0, 5).map((provider) => (
            <a 
              href={provider.directUrl || provider.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              key={provider.provider_id} 
              className="flex flex-col items-center gap-1 group"
              title={`Watch on ${provider.provider_name}`}
            >
              <img 
                src={`${IMAGE_BASE_URL}w92${provider.logo_path}`} 
                alt={provider.provider_name} 
                className="w-10 h-10 rounded-md transition-transform group-hover:scale-110" 
              />
              <span className="text-xs text-text-secondary">{provider.provider_name}</span>
            </a>
          ))
        ) : streamingServices && streamingServices.length > 0 ? (
          // Fallback to AI-recommended services with clickable links
          streamingServices.map((service, index) => {
            // Generate appropriate URL for each service
            const serviceLower = service.toLowerCase();
            let serviceUrl = '';
            
            // Map common services to their URLs
            if (serviceLower.includes('netflix')) {
              serviceUrl = `https://www.netflix.com/search?q=${encodeURIComponent(title)}`;
            } else if (serviceLower.includes('prime') || serviceLower.includes('amazon')) {
              serviceUrl = `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`;
            } else if (serviceLower.includes('disney')) {
              const slugifiedTitle = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
              serviceUrl = `https://www.disneyplus.com/movies/${slugifiedTitle}`;
            } else if (serviceLower.includes('max')) {
              serviceUrl = `https://www.max.com/search?q=${encodeURIComponent(title)}`;
            } else if (serviceLower.includes('hulu')) {
              serviceUrl = `https://www.hulu.com/search?q=${encodeURIComponent(title)}`;
            } else if (serviceLower.includes('apple')) {
              serviceUrl = `https://tv.apple.com/search?term=${encodeURIComponent(title)}`;
            } else {
              // Generic search fallback
              serviceUrl = `https://www.google.com/search?q=watch+${encodeURIComponent(title)}+on+${encodeURIComponent(service)}`;
            }
            
            return (
              <a 
                key={index} 
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
                title={`Watch on ${service}`}
              >
                {getStreamingIcon(service)}
                <span className="text-xs text-text-secondary">{service}</span>
              </a>
            );
          })
        ) : (
          // No provider information available
          <p className="text-text-secondary">{t('recommendationScreen.noStreamingInfo')}</p>
        )}
      </div>
    </div>
  );
};
