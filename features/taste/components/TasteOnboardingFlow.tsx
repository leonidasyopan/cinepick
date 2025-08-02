import React, { useState, useEffect } from 'react';
import StepContainer from '../../../components/StepContainer';
import { useI18n } from '../../../src/i18n/i18n';
import { FilmTasteGame } from './FilmTasteGame';
import { useTaste } from '../TasteContext';
import LoadingScreen from '../../recommendation/components/LoadingScreen';
import { FilmIcon } from '../../../components/icons/FilmIcon';

interface TasteOnboardingFlowProps {
  onComplete: () => void;
}

const TasteOnboardingFlow: React.FC<TasteOnboardingFlowProps> = ({ onComplete }) => {
  const { t } = useI18n();
  const { isLoading: isLoadingTaste, classifiedCount } = useTaste();
  const [step, setStep] = useState<'loading' | 'welcome' | 'game' | 'complete'>('loading');

  useEffect(() => {
    if (!isLoadingTaste) {
      setStep(classifiedCount > 0 ? 'game' : 'welcome');
    }
  }, [isLoadingTaste, classifiedCount]);

  const handleStart = () => setStep('game');
  const handleFinish = () => setStep('complete');


  const renderStep = () => {
    switch (step) {
      case 'loading':
        return <LoadingScreen />;
      case 'welcome':
        return (
          <div className="w-full max-w-3xl mx-auto animate-fade-in text-center flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24 text-accent mb-6 animate-pulse">
              <FilmIcon />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              {t('tasteOnboarding.welcomeTitle')}
            </h2>
            <p className="text-lg text-text-secondary mb-10 max-w-xl">
              {t('tasteOnboarding.welcomeBody')}
            </p>
            <button
              onClick={handleStart}
              className="bg-accent text-background hover:opacity-90 font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-accent/20"
            >
              {t('tasteOnboarding.welcomeButton')}
            </button>
          </div>
        );
      case 'game':
        return <FilmTasteGame onFinish={handleFinish} />;
      case 'complete':
        return (
          <StepContainer title={t('tasteOnboarding.completeTitle')}>
            <div className="text-center max-w-xl mx-auto">
              <p className="text-lg text-text-secondary mb-8">{t('tasteOnboarding.completeBody')}</p>
              <button
                onClick={onComplete}
                className="bg-accent text-background hover:opacity-90 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                {t('tasteOnboarding.completeButton')}
              </button>
            </div>
          </StepContainer>
        );
    }
  };

  return <div className="animate-fade-in w-full h-full flex items-center justify-center">{renderStep()}</div>;
};

export default TasteOnboardingFlow;
