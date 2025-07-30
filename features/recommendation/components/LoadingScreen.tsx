
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

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
            role="alert"
            aria-live="assertive"
            aria-busy="true"
        >
            {/* Animated Poster Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden mask-image-radial-gradient">
                <div className="absolute inset-0 w-full h-full bg-background opacity-50"></div>
                {movies.length > 0 && (
                    <div className="flex animate-marquee-slow whitespace-nowrap blur-sm scale-110">
                        {[...movies, ...movies].map((movie, index) => (
                            <img
                                key={`${movie.id}-${index}`}
                                src={movie.posterPath}
                                alt=""
                                className="w-auto h-screen object-cover mx-2"
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Spinner and Message */}
            <div className="relative flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
                <p className="text-2xl text-white font-semibold tracking-wider mt-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]">
                    {displayMessage}
                </p>
            </div>
            <style>{`
                .mask-image-radial-gradient {
                    mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
                    -webkit-mask-image: radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%);
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-slow {
                    animation: marquee 120s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
