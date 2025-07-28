
import React, { useEffect, useState } from 'react';
import type { MovieRecommendation, UserAnswers } from '../types';
import { IMAGE_BASE_URL, fetchMovieDetailsFromTMDb } from '../services/tmdbService';
import { ImdbIcon, RottenTomatoesIcon } from '../../../components/icons/index';
import { useI18n } from '../../../src/i18n/i18n';
import { StreamingProviders } from './StreamingProviders';

// Streaming icons are now handled by the StreamingProviders component

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
                ) : (
                    part
                )
            )}
        </span>
    );
};


export const RecommendationScreen: React.FC<{ recommendation: MovieRecommendation; answers: UserAnswers; onTryAgain: () => void; onBack: () => void; }> = ({ recommendation: initialRecommendation, answers, onTryAgain, onBack }) => {
    const { t, getTranslatedAnswer } = useI18n();
    const [recommendation, setRecommendation] = useState(initialRecommendation);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    
    // Asynchronously fetch and enhance recommendation with TMDB details
    useEffect(() => {
        const enhanceRecommendation = async () => {
            try {
                // Fetch movie details from TMDB in the background
                const tmdbDetails = await fetchMovieDetailsFromTMDb(
                    recommendation.title,
                    recommendation.year,
                    'en-US' // Could be made configurable
                );
                
                console.log('TMDB Details received:', JSON.stringify(tmdbDetails, null, 2));
                
                // Only merge the details if we actually got something back
                if (tmdbDetails && Object.keys(tmdbDetails).length > 0) {
                    // Merge the details with our existing recommendation
                    // Making sure we don't override existing values with undefined
                    setRecommendation(prev => {
                        const merged = {
                            ...prev,
                            ...tmdbDetails,
                            // Make sure we don't lose the poster path if it exists
                            posterPath: tmdbDetails.posterPath || prev.posterPath,
                            // If we got new providers from TMDB, prefer those over AI-generated ones
                            streamingServices: tmdbDetails.watchProviders && tmdbDetails.watchProviders.length > 0 
                                ? undefined 
                                : prev.streamingServices
                        };
                        console.log('Updated recommendation:', merged);
                        return merged;
                    });
                }
            } catch (error) {
                console.error('Error enhancing recommendation with TMDB details:', error);
                // Continue showing the recommendation with minimal data
            } finally {
                setIsLoadingDetails(false);
            }
        };
        
        enhanceRecommendation();
    }, [initialRecommendation.title, initialRecommendation.year]);

    const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recommendation.trailerSearchQuery)}`;
    const imdbUrl = recommendation.imdbId ? `https://www.imdb.com/title/${recommendation.imdbId}/` : null;
    const rtUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(recommendation.title)}`;

    const translatedAnswers = getTranslatedAnswer(answers);
    const highlights = [
        translatedAnswers.subMood,
        translatedAnswers.occasion,
        ...translatedAnswers.refinements
    ];

    // Use a placeholder image while loading, or fallback if no poster path
    const posterUrl = recommendation.posterPath
        ? `${IMAGE_BASE_URL}w500${recommendation.posterPath}`
        : `https://picsum.photos/seed/${encodeURIComponent(recommendation.title)}/500/750`;

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            <div className="flex-shrink-0 w-60 md:w-72">
                <img
                    src={posterUrl}
                    alt={`Poster for ${recommendation.title}`}
                    className="w-full h-auto rounded-lg shadow-2xl shadow-accent/10 object-cover"
                />
            </div>

            <div className="flex-grow text-center lg:text-left">
                <p className="text-lg text-text-secondary">{t('recommendationScreen.subheading')}</p>
                <h1 className="text-4xl md:text-5xl font-extrabold my-1 text-text-primary">
                    {recommendation.title}
                </h1>
                <p className="text-xl text-text-secondary mb-4">{recommendation.year}</p>

                {/* Details Panel */}
                <div className="flex items-center justify-center lg:justify-start gap-x-3 text-text-secondary text-sm mb-4">
                    {isLoadingDetails ? (
                        <div className="flex gap-3">
                            <div className="w-16 h-4 bg-surface/50 rounded animate-pulse"></div>
                            <div className="w-24 h-4 bg-surface/50 rounded animate-pulse"></div>
                            <div className="w-20 h-4 bg-surface/50 rounded animate-pulse"></div>
                        </div>
                    ) : (
                        <>
                            {recommendation.runtime && <span>{formatRuntime(recommendation.runtime)}</span>}
                            {recommendation.rating && <span className="flex items-center gap-1"> • <span className="font-bold text-accent">{recommendation.rating.score.toFixed(1)}</span> {recommendation.rating.source}</span>}
                            {recommendation.director && <span> • {recommendation.director}</span>}
                        </>
                    )}
                </div>

                {isLoadingDetails && !recommendation.synopsis ? (
                    <div className="mb-4">
                        <div className="w-full h-16 bg-surface/50 rounded animate-pulse"></div>
                    </div>
                ) : recommendation.synopsis ? (
                    <p className="text-sm text-text-secondary mb-4 italic">{recommendation.synopsis}</p>
                ) : null}

                {isLoadingDetails && !recommendation.cast ? (
                    <div className="mb-6">
                        <div className="w-3/4 h-3 bg-surface/50 rounded animate-pulse"></div>
                    </div>
                ) : recommendation.cast ? (
                    <p className="text-xs text-text-secondary mb-6">Starring: {recommendation.cast.join(', ')}</p>
                ) : null}

                {/* Justification */}
                <div className="bg-surface/50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-bold mb-2 text-text-primary">{t('recommendationScreen.justificationHeader')}</h3>
                    <p className="text-md text-text-primary/90 leading-relaxed">
                        <HighlightedText
                            text={recommendation.justification}
                            highlights={highlights}
                        />
                    </p>
                </div>

                {/* Watch On - Async Loading Component */}
                <StreamingProviders 
                    watchProviders={recommendation.watchProviders}
                    streamingServices={recommendation.streamingServices}
                    title={recommendation.title}
                    year={recommendation.year}
                    imdbId={recommendation.imdbId}
                    tmdbId={recommendation.tmdbId}
                    className="mb-6"
                />

                {/* More Details Links */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-3 text-text-primary">{t('recommendationScreen.moreDetails')}</h3>
                    <div className="flex items-center justify-center lg:justify-start gap-4">
                        {imdbUrl && <a href={imdbUrl} target="_blank" rel="noopener noreferrer" aria-label="View on IMDb"><ImdbIcon className="h-8 w-auto hover:opacity-80 transition-opacity" /></a>}
                        <a href={rtUrl} target="_blank" rel="noopener noreferrer" aria-label="Search on Rotten Tomatoes"><RottenTomatoesIcon className="h-8 w-auto hover:opacity-80 transition-opacity" /></a>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a
                        href={trailerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent text-background hover:opacity-90 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                        {t('recommendationScreen.trailerButton')}
                    </a>
                    <button
                        onClick={onTryAgain}
                        className="bg-surface hover:brightness-125 text-text-primary font-bold py-3 px-8 rounded-full transition-all duration-300"
                    >
                        {t('recommendationScreen.tryAgainButton')}
                    </button>
                </div>
                <button
                    onClick={onBack}
                    className="mt-6 text-text-secondary hover:text-text-primary transition-colors duration-300"
                >
                    &larr; {t('common.back')}
                </button>
            </div>
        </div>
    );
};
