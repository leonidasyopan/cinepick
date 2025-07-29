
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const validMovies = useMemo(() => movies.filter(m => m.posterPath), [movies]);

    useEffect(() => {
        if (validMovies.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % validMovies.length);
            }, 5000); // Change movie every 5 seconds

            return () => clearInterval(interval);
        }
    }, [validMovies.length]);

    // Fallback to the classic spinner if movies aren't loaded yet or there are none
    if (isLoading || validMovies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
                <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
                <p className="text-2xl text-text-secondary font-semibold tracking-wider">{t('loadingScreen.message')}</p>
            </div>
        );
    }

    // Define static card widths and gaps for responsive design
    const cardWidthRem = 48; // Corresponds to w-48
    const cardWidthMdRem = 52; // Corresponds to md:w-52
    const gapRem = 4; // Corresponds to gap-4

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
                    maskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 25%, black 75%, transparent)',
                }}
            >
                <div
                    className="absolute flex items-center gap-4 transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(${offset}px)` }}
                >
                    {validMovies.map((movie, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={`${movie.id}-${index}`}
                                className={`relative flex-shrink-0 w-48 md:w-52 rounded-lg overflow-hidden shadow-xl transition-all duration-700 ease-in-out ${isActive ? 'scale-110' : 'scale-90 opacity-50'}`}
                            >
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    className="w-full h-auto object-cover"
                                />
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                                        <div className="absolute bottom-0 left-0 p-3 text-white">
                                            <h3 className="font-bold text-sm leading-tight text-shadow">{movie.title}</h3>
                                            <div className="flex items-center gap-1 mt-1">
                                                <StarIcon className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-semibold">{movie.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;