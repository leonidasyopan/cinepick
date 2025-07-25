/*
import React from 'react';
import type { MovieRecommendation, UserAnswers } from '../types';
import { NetflixIcon, HuluIcon, PrimeVideoIcon, DisneyPlusIcon, MaxIcon, AppleTVIcon, GenericStreamIcon } from './icons';

interface RecommendationScreenProps {
    recommendation: MovieRecommendation;
    answers: UserAnswers;
    onTryAgain: () => void;
    onBack: () => void;
}

const getStreamingIcon = (service: string) => {
    const s = service.toLowerCase();
    if (s.includes('netflix')) return <NetflixIcon />;
    if (s.includes('hulu')) return <HuluIcon />;
    if (s.includes('prime') || s.includes('amazon')) return <PrimeVideoIcon />;
    if (s.includes('disney')) return <DisneyPlusIcon />;
    if (s.includes('max') || s.includes('hbo')) return <MaxIcon />;
    if (s.includes('apple')) return <AppleTVIcon />;
    return <GenericStreamIcon />;
};

const HighlightedText: React.FC<{ text: string, highlights: string[] }> = ({ text, highlights }) => {
    if (!highlights.length) return <>{text}</>;

    const parts = text.split(new RegExp(`(${highlights.join('|')})`, 'gi'));
    
    return (
        <span>
            {parts.map((part, i) =>
                highlights.some(h => part.toLowerCase() === h.toLowerCase()) ? (
                    <span key={i} className="text-accent font-semibold">{part}</span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export const RecommendationScreen: React.FC<RecommendationScreenProps> = ({ recommendation, answers, onTryAgain, onBack }) => {
    const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recommendation.trailerSearchQuery)}`;
    
    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            <div className="flex-shrink-0 w-64 md:w-80">
                <img 
                    src={`https://picsum.photos/seed/${recommendation.title}/500/750`} 
                    alt={`Poster for ${recommendation.title}`}
                    className="w-full h-auto rounded-lg shadow-2xl shadow-accent/10 object-cover" 
                />
            </div>

            <div className="flex-grow text-center lg:text-left">
                <p className="text-lg text-text-secondary">Your Perfect Pick For Tonight Is:</p>
                <h1 className="text-4xl md:text-6xl font-extrabold my-2 text-text-primary">
                    {recommendation.title}
                </h1>
                <p className="text-xl text-text-secondary mb-6">{recommendation.year}</p>

                <div className="bg-surface/50 p-6 rounded-lg mb-6">
                    <p className="text-lg text-text-primary/90 leading-relaxed">
                        <HighlightedText 
                            text={recommendation.justification} 
                            highlights={[answers.subMood, answers.occasion, answers.genre]}
                        />
                    </p>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-3 text-text-primary">Where to Watch</h3>
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                        {recommendation.streamingServices.length > 0 ? recommendation.streamingServices.map((service, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                {getStreamingIcon(service)}
                                <span className="text-xs text-text-secondary">{service}</span>
                            </div>
                        )) : <p className="text-text-secondary">Streaming info not available.</p>}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a 
                        href={trailerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-primary hover:bg-accent text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                    >
                        Watch Trailer
                    </a>
                    <button 
                        onClick={onTryAgain}
                        className="bg-surface hover:bg-primary text-white font-bold py-3 px-8 rounded-full transition-all duration-300"
                    >
                        Not quite? Try again!
                    </button>
                </div>
                 <button 
                    onClick={onBack}
                    className="mt-6 text-text-secondary hover:text-text-primary transition-colors duration-300"
                >
                    &larr; Back
                </button>
            </div>
        </div>
    );
};
*/