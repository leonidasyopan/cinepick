import React, { useState, useEffect } from 'react';
import { getSharedRecommendation } from '../services/sharingService';
import { SharedRecommendationData } from '../types';
import { useI18n } from '../../../src/i18n/i18n';
import { IMAGE_BASE_URL } from '../../recommendation/services/tmdbService';
import { ImdbIcon, RottenTomatoesIcon } from '../../../components/icons/index';
import LoadingScreen from '../../recommendation/components/LoadingScreen';

// Helper functions copied from RecommendationScreen
const formatRuntime = (minutes: number | undefined): string => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

const HighlightedText: React.FC<{ text: string, highlights: string[] }> = ({ text, highlights }) => {
  if (!highlights || !highlights.length) return <>{text}</>;
  const validHighlights = highlights.filter(h => h && typeof h === 'string' && h.trim() !== '');
  if (!validHighlights.length) return <>{text}</>;
  const escapeRegex = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${validHighlights.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        validHighlights.some(h => part.toLowerCase() === h.toLowerCase()) ? (
          <span key={i} className="text-accent font-semibold">{part}</span>
        ) : (part)
      )}
    </span>
  );
};

// Main Component
interface SharedRecommendationPageProps {
  recommendationId: string;
}

const SharedRecommendationPage: React.FC<SharedRecommendationPageProps> = ({ recommendationId }) => {
  const { t, getTranslatedAnswer } = useI18n();
  const [data, setData] = useState<SharedRecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRec = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedData = await getSharedRecommendation(recommendationId);
        if (fetchedData) {
          setData(fetchedData);
        } else {
          setError(t('share.page.notFound'));
        }
      } catch (err) {
        setError(t('app.errorDefault'));
      } finally {
        setLoading(false);
      }
    };
    if (recommendationId) fetchRec();
  }, [recommendationId, t]);

  const handleFindOwnMovie = () => {
    window.location.hash = '/';
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="text-center animate-fade-in flex flex-col items-center gap-6">
        <p className="text-2xl text-text-secondary">{error}</p>
        <button
          onClick={handleFindOwnMovie}
          className="mt-6 bg-accent text-background hover:opacity-90 font-bold py-3 px-8 rounded-full transition-all duration-300"
        >
          {t('share.page.cta')}
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { recommendation, userAnswers } = data;
  const { title, year, posterPath, imdbId, synopsis, runtime, rating, director, cast, justification, trailerSearchQuery } = recommendation;

  const rtUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title)}`;
  const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;
  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(trailerSearchQuery)}`;
  const posterUrl = posterPath ? `${IMAGE_BASE_URL}w500${posterPath}` : `https://picsum.photos/seed/${encodeURIComponent(title)}/500/750`;

  const translatedAnswers = getTranslatedAnswer(userAnswers);
  const highlights = [translatedAnswers.subMood, translatedAnswers.occasion, ...translatedAnswers.refinements];
  const contextText = t('share.page.context', {
    subMood: `"${translatedAnswers.subMood.toLowerCase()}"`,
    occasion: translatedAnswers.occasion.toLowerCase()
  });

  return (
    <div className="w-full flex flex-col items-center gap-8 animate-fade-in">
      <div className="text-center p-4 bg-surface rounded-lg w-full max-w-4xl">
        <p className="text-text-primary italic">{contextText}</p>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          <div className="flex-shrink-0 w-60 md:w-72">
            <img
              src={posterUrl}
              alt={`Poster for ${title}`}
              className="w-full h-auto rounded-lg shadow-2xl shadow-accent/10 object-cover"
            />
          </div>
          <div className="flex-grow text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold my-1 text-text-primary">{title}</h1>
            <p className="text-xl text-text-secondary mb-4">{year}</p>
            <div className="flex items-center justify-center lg:justify-start gap-x-3 text-text-secondary text-sm mb-4">
              {runtime && <span>{formatRuntime(runtime)}</span>}
              {rating && <span className="flex items-center gap-1"> • <span className="font-bold text-accent">{rating.score.toFixed(1)}</span> {rating.source}</span>}
              {director && <span> • {director}</span>}
            </div>
            {synopsis && <p className="text-sm text-text-secondary mb-4 italic">{synopsis}</p>}
            {cast && <p className="text-xs text-text-secondary mb-6">Starring: {cast.join(', ')}</p>}
            <div className="bg-surface/50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-bold mb-2 text-text-primary">{t('recommendationScreen.justificationHeader')}</h3>
              <p className="text-md text-text-primary/90 leading-relaxed">
                <HighlightedText text={justification} highlights={highlights} />
              </p>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3 text-text-primary">{t('recommendationScreen.moreDetails')}</h3>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                {imdbUrl && <a href={imdbUrl} target="_blank" rel="noopener noreferrer" aria-label="View on IMDb"><ImdbIcon className="h-8 w-auto hover:opacity-80 transition-opacity" /></a>}
                <a href={rtUrl} target="_blank" rel="noopener noreferrer" aria-label="Search on Rotten Tomatoes"><RottenTomatoesIcon className="h-8 w-auto hover:opacity-80 transition-opacity" /></a>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/80 text-text-primary hover:bg-primary font-bold py-3 px-8 rounded-full transition-all duration-300"
              >
                {t('recommendationScreen.trailerButton')}
              </a>
              <button
                onClick={handleFindOwnMovie}
                className="bg-accent text-background hover:opacity-90 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                {t('share.page.cta')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SharedRecommendationPage;
