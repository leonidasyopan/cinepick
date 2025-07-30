
import React from 'react';
import { useI18n } from '../../../src/i18n/i18n';
import { useTrendingMovies } from '../../trending/TrendingMoviesContext';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
    const { t } = useI18n();
    const { movies } = useTrendingMovies();

    const displayMessage = message || t('loadingScreen.message');

    // Duplicate movies for seamless looping
    const posters = movies.length > 0 ? [...movies, ...movies] : [];

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in"
            role="alert"
            aria-live="assertive"
            aria-busy="true"
        >
            <div className="flex-grow flex flex-col items-center justify-center">
                {/* Spinner and Message */}
                <div className="relative flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
                    <p className="text-2xl text-white font-semibold tracking-wider mt-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                        {displayMessage}
                    </p>
                </div>
            </div>

            {/* Poster Marquee */}
            {posters.length > 0 && (
                <div className="w-full h-48 md:h-64 flex-shrink-0 overflow-hidden relative">
                    <div className="absolute inset-0 z-10 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
                        <div className="flex animate-marquee whitespace-nowrap h-full">
                            {posters.map((movie, index) => (
                                <div key={`${movie.id}-${index}`} className="flex-shrink-0 mx-2 h-full">
                                    <img
                                        src={movie.posterPath}
                                        alt=""
                                        className="h-full w-auto object-cover rounded-lg shadow-lg opacity-40"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 80s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
