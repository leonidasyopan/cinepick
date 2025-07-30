
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useI18n } from '../../../src/i18n/i18n';
import { useTrendingMovies } from '../../trending/TrendingMoviesContext';

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.788 3.21 c 0.448 -1.077 1.976 -1.077 2.424 0 l 2.082 5.007 5.404 0.433 c 1.164 0.093 1.636 1.545 0.749 2.305 l -4.116 3.986 1.257 5.273 c 0.271 1.136 -0.964 2.033 -1.96 1.425 L 12 18.354 l -4.733 2.98 c -1 -0.608 -2.23 -0.288 -1.96 -1.425 l 1.257 -5.273 -4.117 -3.986 c -0.887 -0.76 -0.415 -2.212 0.749 -2.305 l 5.404 -0.433 L 10.788 3.21 z" clipRule="evenodd" />
    </svg>
);

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
    const { t } = useI18n();
    const { movies, isLoading } = useTrendingMovies();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const displayMessage = message || t('loadingScreen.message');

    const validMovies = useMemo(() => movies.filter(m => m.posterPath), [movies]);
    const postersLength = validMovies.length;

    // Create a triplicated list for seamless looping.
    const loopedMovies = useMemo(() => {
        if (postersLength === 0) return [];
        return [...validMovies, ...validMovies, ...validMovies];
    }, [validMovies, postersLength]);

    // Set a random starting index in the *middle* of the looped list
    useEffect(() => {
        if (postersLength > 0) {
            setCurrentIndex(postersLength + Math.floor(Math.random() * postersLength));
        }
    }, [postersLength]);

    // This single effect manages the entire carousel state machine.
    useEffect(() => {
        if (postersLength === 0) return;

        // State 1: A jump just happened, transitions are off. Re-enable them.
        if (!isTransitionEnabled) {
            const timer = setTimeout(() => setIsTransitionEnabled(true), 50);
            return () => clearTimeout(timer);
        }

        // State 2: We've scrolled to the third block. Time to schedule a jump.
        if (currentIndex >= postersLength * 2) {
            const timer = setTimeout(() => {
                // Let the animation finish, then jump without animation.
                setIsTransitionEnabled(false);
                setCurrentIndex(postersLength + (currentIndex % postersLength));
            }, 700); // This MUST match the CSS transition duration
            return () => clearTimeout(timer);
        }

        // State 3: Normal operation. Set an interval for the next scroll.
        const interval = setInterval(() => {
            setCurrentIndex(prev => prev + 1);
        }, 3000);

        return () => clearInterval(interval);

    }, [currentIndex, postersLength, isTransitionEnabled]);


    // Fallback to the classic spinner
    if (isLoading || loopedMovies.length === 0 || currentIndex === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
                <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
                <p className="text-2xl text-text-secondary font-semibold tracking-wider">{displayMessage}</p>
            </div>
        );
    }

    const cardWidthRem = 48; // Corresponds to w-48
    const cardWidthMdRem = 52; // Corresponds to md:w-52
    const gapRem = 4; // Corresponds to gap-4

    // This calculation is a bit brittle, but works for the current design.
    // A more robust solution would measure the DOM elements directly.
    const cardWidthPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * (window.innerWidth < 768 ? cardWidthRem / 4 : cardWidthMdRem / 4);
    const gapPx = parseFloat(getComputedStyle(document.documentElement).fontSize) * (gapRem / 4);

    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const offset = (containerWidth / 2) - (cardWidthPx / 2) - (currentIndex * (cardWidthPx + gapPx));

    return (
        <div className="flex flex-col items-center justify-center w-full gap-6 animate-fade-in">
            <p className="text-2xl text-text-secondary font-semibold tracking-wider">{displayMessage}</p>
            <div
                ref={containerRef}
                className="relative w-full h-80 md:h-96 flex items-center justify-center overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
            >
                <div
                    className="absolute flex items-center gap-4"
                    style={{
                        transform: `translateX(${offset}px)`,
                        transition: isTransitionEnabled ? 'transform 0.7s ease-in-out' : 'none',
                    }}
                >
                    {loopedMovies.map((movie, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={`${movie.id}-${index}`}
                                className={`relative flex-shrink-0 w-48 md:w-52 rounded-lg overflow-hidden shadow-xl transition-all duration-700 ease-in-out ${isActive ? 'scale-110' : 'scale-90 opacity-40'}`}
                            >
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    className="w-full h-auto object-cover"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100 z-10' : 'opacity-0'}`}>
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
