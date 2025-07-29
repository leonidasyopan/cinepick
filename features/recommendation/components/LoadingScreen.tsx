

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useI18n } from '../../../src/i18n/i18n';
import { useTrendingMovies } from '../../trending/TrendingMoviesContext';

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21 c 0.448 -1.077 1.976 -1.077 2.424 0 l 2.082 5.007 5.404 0.433 c 1.164 0.093 1.636 1.545 0.749 2.305 l -4.116 3.986 1.257 5.273 c 0.271 1.136 -0.964 2.033 -1.96 1.425 L 12 18.354 l -4.733 2.98 c -1 -0.608 -2.23 -0.288 -1.96 -1.425 l 1.257 -5.273 -4.117 -3.986 c -0.887 -0.76 -0.415 -2.212 0.749 -2.305 l 5.404 -0.433 L 10.788 3.21 z" clipRule="evenodd" />
    </svg>
);


const LoadingScreen: React.FC = () => {
    const { t } = useI18n();
    const { movies, isLoading } = useTrendingMovies();
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const validMovies = useMemo(() => movies.filter(m => m.posterPath), [movies]);

    // Create a triplicated list to make the loop practically infinite for this screen's lifetime.
    const loopedMovies = useMemo(() => {
        if (validMovies.length === 0) return [];
        return [...validMovies, ...validMovies, ...validMovies];
    }, [validMovies]);

    // Set a random starting index in the *middle* of the looped list
    useEffect(() => {
        if (validMovies.length > 0 && currentIndex === null) {
            // Start in the second repetition of the list to ensure seamless looping
            const randomIndex = Math.floor(Math.random() * validMovies.length);
            setCurrentIndex(validMovies.length + randomIndex);
        }
    }, [validMovies, currentIndex]);

    // Set up the auto-scrolling interval to continuously increment the index
    useEffect(() => {
        if (loopedMovies.length > 1 && currentIndex !== null) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex ?? 0) + 1);
            }, 3000); // Change movie every 3 seconds

            return () => clearInterval(interval);
        }
    }, [loopedMovies.length, currentIndex]);

    // Fallback to the classic spinner
    if (isLoading || loopedMovies.length === 0 || currentIndex === null) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
                <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
                <p className="text-2xl text-text-secondary font-semibold tracking-wider">{t('loadingScreen.message')}</p>
            </div>
        );
    }

    const cardWidthRem = 48; // w-48
    const cardWidthMdRem = 52; // md:w-52
    const gapRem = 4; // gap-4

    const cardWidthPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * (window.innerWidth < 768 ? cardWidthRem / 4 : cardWidthMdRem / 4);
    const gapPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * (gapRem / 4);

    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const offset = (containerWidth / 2) - (cardWidthPx / 2) - (currentIndex * (cardWidthPx + gapPx));

    return (
        <div className="flex flex-col items-center justify-center w-full gap-6 animate-fade-in">
            <p className="text-2xl text-text-secondary font-semibold tracking-wider">{t('loadingScreen.message')}</p>
            <div
                ref={containerRef}
                className="relative w-full h-80 md:h-96 flex items-center justify-center overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
            >
                <div
                    className="absolute flex items-center gap-4 transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(${offset}px)` }}
                >
                    {loopedMovies.map((movie, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={`${movie.id}-${index}`}
                                className={`relative flex-shrink-0 w-48 md:w-52 rounded-lg overflow-hidden shadow-xl transition-all duration-700 ease-in-out ${isActive ? 'scale-110 z-10' : 'scale-90 opacity-40'}`}
                            >
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    className="w-full h-auto object-cover"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="absolute bottom-0 left-0 p-3 text-white w-full">
                                        <h3 className="font-bold text-lg leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,1)]">{movie.title}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <StarIcon className="w-5 h-5 text-accent" />
                                            <span className="text-sm font-semibold [text-shadow:0_1px_4px_rgba(0,0,0,1)]">{movie.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;