import React, { useEffect, useState } from 'react';
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
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadProviders = async () => {
      // Start with loading state
      setIsLoading(true);
      
      try {
        // Use existing providers if available (for better perceived performance)
        if (watchProviders && watchProviders.length > 0) {
          setProviders(watchProviders);
          setIsLoading(false);
        }
        
        // If we have a tmdbId, fetch fresh providers asynchronously
        if (tmdbId) {
          // This is a completely separate API call for better performance
          const freshProviders = await fetchStreamingProviders(
            tmdbId,
            title,
            year,
            'en-US', // We could pass locale as a prop if needed
            imdbId
          );
          
          if (freshProviders.length > 0) {
            setProviders(freshProviders);
          }
        }
      } catch (error) {
        console.error('Error fetching streaming providers:', error);
        // Keep any existing providers we may have
        if (watchProviders && watchProviders.length > 0) {
          setProviders(watchProviders);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProviders();
  }, [watchProviders, title, year, imdbId, tmdbId]);
  
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
        {providers.length > 0 ? providers.slice(0, 5).map((provider) => (
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
        )) : (streamingServices && streamingServices.length > 0) ? streamingServices.map((service, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            {getStreamingIcon(service)}
            <span className="text-xs text-text-secondary">{service}</span>
          </div>
        )) : <p className="text-text-secondary">{t('recommendationScreen.noStreamingInfo')}</p>}
      </div>
    </div>
  );
};
