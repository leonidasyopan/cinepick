

import React, { useState, useEffect, useRef } from 'react';
import type { MovieRecommendation, UserAnswers, WatchProvider } from '../types';
import { IMAGE_BASE_URL, reFetchMovieDetails } from '../services/tmdbService';
import { translateText } from '../services/translationService';
import { NetflixIcon, HuluIcon, PrimeVideoIcon, DisneyPlusIcon, MaxIcon, AppleTVIcon, GenericStreamIcon, ImdbIcon, RottenTomatoesIcon } from '../../../components/icons/index';
import { useI18n } from '../../../src/i18n/i18n';
import { useAuth } from '../../auth/AuthContext';
import { saveSharedRecommendation } from '../../sharing/services/sharingService';
import { doc, collection } from 'firebase/firestore';
import { db } from '../../../firebase';

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

const formatRuntime = (minutes: number | undefined): string => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

// Robust Base64 encoding for UTF-8 characters
const utf8_to_b64 = (str: string): string => {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    } catch (e) {
        console.error("utf8_to_b64 failed:", e);
        return "";
    }
}

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


export const RecommendationScreen: React.FC<{
    recommendation: MovieRecommendation;
    answers: UserAnswers;
    onTryAgain: () => void;
    onBack: () => void;
    showTryAgainButton?: boolean;
}> = ({ recommendation, answers, onTryAgain, onBack, showTryAgainButton = true }) => {
    const { t, locale, getTranslatedAnswer } = useI18n();
    const { isFirebaseEnabled, user } = useAuth();
    const [displayedRec, setDisplayedRec] = useState<MovieRecommendation>(recommendation);
    const [isUpdating, setIsUpdating] = useState(false);

    const [isSharing, setIsSharing] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [shareConfirmation, setShareConfirmation] = useState('');
    const [shareError, setShareError] = useState('');

    const initialLocale = useRef(locale);
    const translationCache = useRef<{ [key: string]: MovieRecommendation }>({
        [locale]: recommendation
    }).current;

    // Effect to reset state if the parent `recommendation` prop changes (e.g., "Try Again")
    useEffect(() => {
        setDisplayedRec(recommendation);
        setShareUrl(null); // Reset share URL for new recommendation
        setShareConfirmation('');
        setShareError('');
        Object.keys(translationCache).forEach(key => delete translationCache[key]);
        translationCache[initialLocale.current] = recommendation;
    }, [recommendation, translationCache]);

    // Effect to handle language changes
    useEffect(() => {
        // Do not run on the initial render for the initial locale
        if (locale === initialLocale.current) return;

        const updateLanguage = async () => {
            // Check cache first
            if (translationCache[locale]) {
                setDisplayedRec(translationCache[locale]);
                return;
            }

            // If not in cache, fetch and translate
            setIsUpdating(true);
            try {
                const { tmdbId, originalTitle, justification } = recommendation;

                if (!tmdbId || !originalTitle) {
                    throw new Error("Missing data required for translation (tmdbId or originalTitle).");
                }

                const tmdbPromise = reFetchMovieDetails(tmdbId, originalTitle, locale);
                const justificationPromise = translateText(justification, locale);

                const [newTmdbDetails, translatedJustification] = await Promise.all([
                    tmdbPromise,
                    justificationPromise
                ]);

                const newRecommendation: MovieRecommendation = {
                    ...recommendation, // Base recommendation for fallback
                    ...newTmdbDetails, // Overwrite with new TMDb data (title, synopsis, etc.)
                    justification: translatedJustification, // Overwrite with new justification
                };

                translationCache[locale] = newRecommendation;
                setDisplayedRec(newRecommendation);

            } catch (error) {
                console.error("Failed to update language:", error);
                // Optionally show an error toast to the user
            } finally {
                setIsUpdating(false);
            }
        };

        updateLanguage();

    }, [locale, recommendation, translationCache]);


    const { title, year, posterPath, trailerSearchQuery, imdbId, synopsis, runtime, rating, director, cast, justification, watchProviders, streamingServices } = displayedRec;
    const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(trailerSearchQuery)}`;
    const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;
    const rtUrl = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title)}`;

    const translatedAnswers = getTranslatedAnswer(answers);
    const highlights = [
        translatedAnswers.subMood,
        translatedAnswers.occasion,
        ...translatedAnswers.refinements
    ];

    const currentWatchProviders = watchProviders?.filter(p => p.logo_path) || [];

    const posterUrl = posterPath
        ? `${IMAGE_BASE_URL}w500${posterPath}`
        : `https://picsum.photos/seed/${encodeURIComponent(title)}/500/750`;

    const handleShare = async () => {
        setIsSharing(true);
        setShareError('');
        setShareConfirmation('');

        const sharePayload = {
            title: t('share.title', { movie: title }),
            text: justification,
            url: '',
        };

        const currentTranslatedAnswers = getTranslatedAnswer(answers);
        const recommendationData = {
            recommendation: displayedRec,
            userAnswers: answers,
            locale: locale,
            sharerName: user?.displayName || undefined,
            translatedSubMood: currentTranslatedAnswers.subMood,
        };

        // --- Tier 1: Advanced Sharing with Firebase for Rich Previews ---
        if (isFirebaseEnabled && db) {
            let urlToShare = shareUrl;
            let newId = '';

            // Generate a new ID and URL if one hasn't been created for this recommendation yet
            if (!urlToShare) {
                newId = doc(collection(db, 'sharedRecommendations')).id;
                urlToShare = `${window.location.origin}/share/${newId}`;
                setShareUrl(urlToShare);
            }
            sharePayload.url = urlToShare;

            try {
                if (navigator.share) {
                    await navigator.share(sharePayload);
                } else {
                    await navigator.clipboard.writeText(sharePayload.url);
                    setShareConfirmation(t('share.linkCopied'));
                }
                // Save to Firestore in the background *after* successful share
                if (newId) {
                    saveSharedRecommendation(newId, recommendationData).catch(error => {
                        console.error("Background save to Firestore failed:", error);
                    });
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Advanced sharing failed", error);
                    setShareError(t('share.error'));
                }
            } finally {
                setIsSharing(false);
                setTimeout(() => setShareConfirmation(''), 2500);
            }

            // --- Tier 2: Fallback Sharing (Client-side only) ---
        } else {
            try {
                const encodedData = utf8_to_b64(JSON.stringify(recommendationData));
                sharePayload.url = `${window.location.origin}${window.location.pathname}#/view/${encodedData}`;

                if (navigator.share) {
                    await navigator.share(sharePayload);
                } else {
                    await navigator.clipboard.writeText(sharePayload.url);
                    setShareConfirmation(t('share.linkCopied'));
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Fallback sharing failed", error);
                    setShareError(t('share.error'));
                }
            } finally {
                setIsSharing(false);
                setTimeout(() => {
                    setShareConfirmation('');
                    setShareError('');
                }, 2500);
            }
        }
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto animate-fade-in">
            {isUpdating && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                    <div className="w-12 h-12 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
                </div>
            )}
            <div className={`flex flex-col lg:flex-row gap-8 items-center lg:items-start transition-opacity duration-300 ${isUpdating ? 'opacity-30' : 'opacity-100'}`}>
                <div className="flex-shrink-0 w-60 md:w-72">
                    <img
                        src={posterUrl}
                        alt={`Poster for ${title}`}
                        className="w-full h-auto rounded-lg shadow-2xl shadow-accent/10 object-cover"
                    />
                </div>

                <div className="flex-grow text-center lg:text-left">
                    <p className="text-lg text-text-secondary">{t('recommendationScreen.subheading')}</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold my-1 text-text-primary">
                        {title}
                    </h1>
                    <p className="text-xl text-text-secondary mb-4">{year}</p>

                    {/* Details Panel */}
                    <div className="flex items-center justify-center lg:justify-start gap-x-3 text-text-secondary text-sm mb-4">
                        {runtime && <span>{formatRuntime(runtime)}</span>}
                        {rating && <span className="flex items-center gap-1"> • <span className="font-bold text-accent">{rating.score.toFixed(1)}</span> {rating.source}</span>}
                        {director && <span> • {director}</span>}
                    </div>

                    {synopsis && <p className="text-sm text-text-secondary mb-4 italic">{synopsis}</p>}

                    {cast && <p className="text-xs text-text-secondary mb-6">Starring: {cast.join(', ')}</p>}

                    {/* Justification */}
                    <div className="bg-surface/50 p-4 rounded-lg mb-6">
                        <h3 className="text-lg font-bold mb-2 text-text-primary">{t('recommendationScreen.justificationHeader')}</h3>
                        <p className="text-md text-text-primary/90 leading-relaxed">
                            <HighlightedText
                                text={justification}
                                highlights={highlights}
                            />
                        </p>
                    </div>

                    {/* Watch On */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3 text-text-primary">{t('recommendationScreen.watchOn')}</h3>
                        <div className="flex flex-wrap items-start justify-center lg:justify-start gap-x-4 gap-y-2">
                            {currentWatchProviders.length > 0 ? currentWatchProviders.slice(0, 5).map((provider) => (
                                <a href={provider.link} target="_blank" rel="noopener noreferrer" key={provider.provider_id} className="flex flex-col items-center gap-1.5 group w-20 text-center">
                                    <img src={`${IMAGE_BASE_URL}w92${provider.logo_path}`} alt={provider.provider_name} className="w-12 h-12 rounded-lg transition-transform group-hover:scale-110" />
                                    <span className="text-xs text-text-secondary truncate w-full">{provider.provider_name}</span>
                                </a>
                            )) : (streamingServices && streamingServices.length > 0) ? streamingServices.map((service, index) => (
                                <div key={index} className="flex flex-col items-center gap-2 w-20 text-center">
                                    {getStreamingIcon(service)}
                                    <span className="text-xs text-text-secondary truncate w-full">{service}</span>
                                </div>
                            )) : <p className="text-text-secondary">{t('recommendationScreen.noStreamingInfo')}</p>}
                        </div>
                    </div>

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
                        {showTryAgainButton && (
                            <button
                                onClick={onTryAgain}
                                className="bg-surface hover:brightness-125 text-text-primary font-bold py-3 px-8 rounded-full transition-all duration-300"
                            >
                                {t('recommendationScreen.tryAgainButton')}
                            </button>
                        )}
                        <div className="relative">
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="w-full bg-surface hover:brightness-125 text-text-primary font-bold py-3 px-8 rounded-full transition-all duration-300 disabled:opacity-50"
                                aria-label={t('share.buttonLabel')}
                            >
                                {isSharing ? (
                                    <div className="w-5 h-5 mx-auto border-2 rounded-full border-text-secondary border-t-accent animate-spin" />
                                ) : (
                                    t('recommendationScreen.shareButton')
                                )}
                            </button>
                            {shareConfirmation && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg animate-fade-in">{shareConfirmation}</span>}
                            {shareError && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg animate-fade-in">{shareError}</span>}
                        </div>
                    </div>
                    <button
                        onClick={onBack}
                        className="mt-6 text-text-secondary hover:text-text-primary transition-colors duration-300"
                    >
                        &larr; {t('common.back')}
                    </button>
                </div>
            </div>
        </div>
    );
};