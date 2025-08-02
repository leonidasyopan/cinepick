import React, { useState } from 'react';
import StepContainer from '../../../components/StepContainer';
import { useI18n } from '../../../src/i18n/i18n';
import { useTaste } from '../TasteContext';
import { TasteMovie } from '../types';

const MovieCard: React.FC<{
  movie: TasteMovie;
  onClick: () => void;
  isWinner: boolean | null;
}> = ({ movie, onClick, isWinner }) => {
  const baseTransition = 'transition-all duration-500 ease-in-out';
  let cardStyle = '';

  if (isWinner === true) {
    cardStyle = 'scale-110 opacity-100 z-10';
  } else if (isWinner === false) {
    cardStyle = 'scale-90 opacity-0 blur-sm';
  } else {
    cardStyle = 'scale-100 opacity-100 group-hover:scale-105';
  }

  return (
    <div className="w-48 md:w-56 group cursor-pointer" onClick={onClick}>
      <div
        className={`relative w-full aspect-[2/3] rounded-lg shadow-xl ${baseTransition} ${cardStyle}`}
      >
        <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} className="w-full h-full object-cover rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg" />
        <h3 className="absolute bottom-2 left-3 right-3 text-white font-bold text-lg leading-tight [text-shadow:0_1px_4px_rgba(0,0,0,1)]">{movie.title}</h3>
      </div>
    </div>
  );
};


export const FilmTasteGame: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { t } = useI18n();
  const { currentPair, classifyPreference, classifiedCount, totalMoviesInGame } = useTaste();
  const [winner, setWinner] = useState<TasteMovie | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (selectedWinner: TasteMovie) => {
    if (isAnimating || !currentPair) return;

    const loser = currentPair.find(m => m.tmdbId !== selectedWinner.tmdbId)!;
    setIsAnimating(true);
    setWinner(selectedWinner);

    setTimeout(() => {
      classifyPreference(selectedWinner, loser).then(() => {
        setWinner(null);
        setIsAnimating(false);
      });
    }, 600); // Animation duration
  };

  if (!currentPair) {
    return (
      <StepContainer title={t('tasteOnboarding.gameTitle')} subtitle="You've classified all the films!">
        <div className="text-center mt-8">
          <button
            onClick={onFinish}
            className="bg-accent text-background hover:opacity-90 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            {t('common.done')}
          </button>
        </div>
      </StepContainer>
    );
  }

  const [movieA, movieB] = currentPair;

  return (
    <StepContainer title={t('tasteOnboarding.gameTitle')} subtitle={t('tasteOnboarding.gameSubtitle')}>
      <div className="flex flex-col items-center gap-6">
        {/* Progress Bar */}
        <div className="w-full max-w-lg bg-surface rounded-full h-2.5">
          <div
            className="bg-accent h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(classifiedCount / (totalMoviesInGame - 1)) * 100}%` }}
          />
        </div>

        {/* Movie Cards */}
        <div className="flex items-center justify-center gap-6 md:gap-10 h-96">
          <MovieCard movie={movieA} onClick={() => handleSelect(movieA)} isWinner={winner ? winner.tmdbId === movieA.tmdbId : null} />
          <span className="text-text-secondary font-bold text-lg">VS</span>
          <MovieCard movie={movieB} onClick={() => handleSelect(movieB)} isWinner={winner ? winner.tmdbId === movieB.tmdbId : null} />
        </div>

        {/* Finish Button */}
        <div className="mt-4 h-12">
          {classifiedCount >= 3 && (
            <button
              onClick={onFinish}
              className="bg-primary hover:bg-surface text-text-primary font-bold py-2 px-6 rounded-full transition-all duration-300"
            >
              {t('tasteOnboarding.gameFinishButton')}
            </button>
          )}
        </div>
      </div>
    </StepContainer>
  );
};
