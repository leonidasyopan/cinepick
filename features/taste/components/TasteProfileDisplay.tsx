import React, { useState, useEffect } from 'react';
import { useTaste } from '../TasteContext';
import { useI18n } from '../../../src/i18n/i18n';
import { SparklesIcon } from '../../../components/icons/SparklesIcon';

export const TasteProfileDisplay: React.FC = () => {
  const { t } = useI18n();
  const {
    tasteProfile,
    isGeneratingProfile,
    generateAndSaveProfile,
    refineAndSaveProfile,
    isGameCompleted,
  } = useTaste();

  const [isDisagreeing, setIsDisagreeing] = useState(false);
  const [disagreementText, setDisagreementText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Trigger initial profile generation if the game is complete but there's no profile yet.
    if (isGameCompleted && !tasteProfile && !isGeneratingProfile) {
      generateAndSaveProfile().catch(() => {
        setError(t('auth.taste.profileError'));
      });
    }
  }, [isGameCompleted, tasteProfile, isGeneratingProfile, generateAndSaveProfile, t]);

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disagreementText.trim()) return;
    setError('');
    try {
      await refineAndSaveProfile(disagreementText);
      setIsDisagreeing(false);
      setDisagreementText('');
    } catch {
      setError(t('auth.taste.profileError'));
    }
  };

  if (isGeneratingProfile && !tasteProfile) {
    return (
      <div className="flex flex-col gap-2 p-4 bg-primary/50 rounded-lg items-center text-center">
        <div className="w-8 h-8 border-2 rounded-full border-surface border-t-accent animate-spin" />
        <p className="text-sm text-text-secondary">{t('auth.taste.profileLoading')}</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 text-center p-4 bg-red-500/10 rounded-lg">{error}</p>
  }

  if (!tasteProfile) {
    // This state should ideally not be hit if the trigger logic is correct, but it's a safe fallback.
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-primary/50 rounded-lg relative">
      {isGeneratingProfile && (
        <div className="absolute inset-0 bg-primary/80 flex items-center justify-center z-10 rounded-lg animate-fade-in">
          <div className="w-8 h-8 border-2 rounded-full border-surface border-t-accent animate-spin" />
        </div>
      )}
      <div className={`transition-opacity duration-300 ${isGeneratingProfile ? 'opacity-30' : 'opacity-100'}`}>
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-accent" />
          {t('auth.taste.profileTitle')}
        </h3>
        <p className="text-xs text-text-secondary mb-2">{t('auth.taste.profileDescription')}</p>

        <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed bg-surface/50 p-3 rounded-md">
          {tasteProfile}
        </p>

        {isDisagreeing ? (
          <form onSubmit={handleRefineSubmit} className="mt-3 flex flex-col gap-2 animate-fade-in">
            <label htmlFor="refinement-text" className="text-sm font-medium text-text-secondary">
              {t('auth.taste.refinePrompt')}
            </label>
            <textarea
              id="refinement-text"
              value={disagreementText}
              onChange={(e) => setDisagreementText(e.target.value)}
              className="bg-primary border border-primary/50 text-text-primary rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent w-full h-24 resize-none"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDisagreeing(false)}
                className="bg-surface hover:brightness-125 text-text-secondary text-xs font-semibold py-1.5 px-3 rounded-md transition-all"
              >
                {t('auth.taste.cancelRefinement')}
              </button>
              <button
                type="submit"
                disabled={isGeneratingProfile}
                className="bg-accent hover:opacity-90 text-background text-xs font-semibold py-1.5 px-3 rounded-md transition-opacity disabled:opacity-50"
              >
                {t('auth.taste.submitRefinement')}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-right mt-2">
            <button onClick={() => setIsDisagreeing(true)} className="text-xs text-accent hover:underline">
              {t('auth.taste.disagreeButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
