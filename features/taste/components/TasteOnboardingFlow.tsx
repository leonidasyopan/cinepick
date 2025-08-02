import React, { useState } from 'react';
import StepContainer from '../../../components/StepContainer';
import { useI18n } from '../../../src/i18n/i18n';
import { FilmTasteGame } from './FilmTasteGame';
import { useTaste } from '../TasteContext';
import LoadingScreen from '../../recommendation/components/LoadingScreen';

interface TasteOnboardingFlowProps {
  onComplete: () => void;
}

const TasteOnboardingFlow: React.FC<TasteOnboardingFlowProps> = ({ onComplete }) => {
  const { t } = useI18n();
  const { isLoading: isLoadingTaste } = useTaste();
  const [step, setStep] = useState<'welcome' | 'game' | 'complete'>('welcome');

  if (isLoadingTaste) {
    return <LoadingScreen />;
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <StepContainer title={t('tasteOnboarding.welcomeTitle')}>
            <div className="text-center max-w-xl mx-auto">
              <p className="text-lg text-text-secondary mb-8">{t('tasteOnboarding.welcomeBody')}</p>
              <button
                onClick={() => setStep('game')}
                className="bg-accent text-background hover:opacity-90 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                {t('tasteOnboarding.welcomeButton')}
              </button>
            </div>
          </StepContainer>
        );
      case 'game':
        return <FilmTasteGame onFinish={() => setStep('complete')} />;
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

  return <div className="animate-fade-in">{renderStep()}</div>;
};

export default TasteOnboardingFlow;
