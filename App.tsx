

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserAnswers, PartialUserAnswers, MovieRecommendation, UserPreferences } from './features/recommendation/types';
import { getMovieRecommendation } from './features/recommendation/services/geminiService';
import { RecommendationScreen } from './features/recommendation/components/RecommendationScreen';
import MoodSelector from './features/recommendation/components/MoodSelector';
import SubMoodStep from './features/recommendation/components/SubMoodStep';
import OccasionStep from './features/recommendation/components/OccasionStep';
import RefinementStep from './features/recommendation/components/RefinementStep';
import LoadingScreen from './features/recommendation/components/LoadingScreen';
import { LanguageSwitcher } from './src/components/LanguageSwitcher';
import { useI18n } from './src/i18n/i18n';
import { useAuth } from './features/auth/AuthContext';
import AuthModal from './features/auth/components/AuthModal';
import ProfileModal from './features/auth/components/ProfileModal';
import { UserIcon, HistoryIcon } from './components/icons';
import { useHistory } from './features/history/HistoryContext';
import type { HistoryItem } from './features/history/types';
import HistoryModal from './features/history/components/HistoryModal';
import { getMovieDetailsForHistory } from './features/history/services/tmdbHistoryService';

// The 'loading' step has been removed to fix architectural issues.
const STEP_HASH_MAP: { [key: number]: string } = {
    1: 'mood',
    2: 'submood',
    3: 'occasion',
    4: 'refine',
    5: 'result', // Result is now step 5
};

const HASH_STEP_MAP: { [key: string]: number } = Object.entries(STEP_HASH_MAP)
    .reduce((acc, [key, value]) => ({ ...acc, [value]: parseInt(key, 10) }), {});

const getStepFromHash = () => HASH_STEP_MAP[window.location.hash.substring(1)] || 1;

const App: React.FC = () => {
    const { t, locale, getTranslatedAnswer } = useI18n();
    const { user, loading: authLoading, preferences, isFirebaseEnabled } = useAuth();
    const { addHistoryItem } = useHistory();

    const [step, setStep] = useState(getStepFromHash());
    const [answers, setAnswers] = useState<PartialUserAnswers>({});
    const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
    const [previousSuggestions, setPreviousSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);

    // Refs to hold current state values for use in callbacks that might have stale closures.
    const answersRef = useRef(answers);
    answersRef.current = answers;
    const recommendationRef = useRef(recommendation);
    recommendationRef.current = recommendation;
    const stepRef = useRef(step);
    stepRef.current = step;

    // A ref to prevent hashchange from firing multiple times during a single transition.
    const isTransitioningRef = useRef(false);

    // --- START: NAVIGATION FIX ---
    // This effect ensures navigation to the result screen only happens *after* the recommendation state is set.
    // This fixes the race condition where the app would navigate before the data was ready, causing a reset.
    useEffect(() => {
        if (recommendation && stepRef.current !== 5) {
            window.location.hash = STEP_HASH_MAP[5];
        }
    }, [recommendation]);
    // --- END: NAVIGATION FIX ---


    const handleReset = useCallback(() => {
        setIsFading(true);
        setTimeout(() => {
            // Reset all state values
            setStep(1);
            setAnswers({});
            setRecommendation(null);
            setPreviousSuggestions([]);
            setError(null);
            setIsLoading(false);
            setLoadingMessage(undefined);
            // Navigate to the first step
            window.location.hash = STEP_HASH_MAP[1];
            // Fade back in
            setIsFading(false);
        }, 300);
    }, []);

    useEffect(() => {
        const initialStep = getStepFromHash();
        const isStateSufficientForStep = (targetStep: number, currentAnswers: PartialUserAnswers, currentRec: MovieRecommendation | null) => {
            if (targetStep <= 1) return true;
            if (targetStep === 2) return !!currentAnswers.mood;
            if (targetStep === 3) return !!currentAnswers.mood && !!currentAnswers.subMood;
            if (targetStep === 4) return !!currentAnswers.mood && !!currentAnswers.subMood && !!currentAnswers.occasion;
            if (targetStep === 5) return !!currentRec;
            return false;
        };

        // On initial load, if the hash points to a step the app has no state for, reset.
        if (!isStateSufficientForStep(initialStep, answersRef.current, recommendationRef.current)) {
            window.location.hash = STEP_HASH_MAP[1];
            setStep(1);
        }

        const handleHashChange = () => {
            if (isTransitioningRef.current) return;

            const newStep = getStepFromHash();

            // If state is not sufficient for the new step (e.g., user manually changed URL), reset.
            if (!isStateSufficientForStep(newStep, answersRef.current, recommendationRef.current)) {
                handleReset();
                return;
            }

            // Do nothing if the step hasn't changed.
            if (newStep === stepRef.current) return;

            isTransitioningRef.current = true;
            setIsFading(true);
            setTimeout(() => {
                // When going back, clear answers for steps that are ahead.
                if (newStep < stepRef.current) {
                    setAnswers(currentAnswers => {
                        const newAnswers: PartialUserAnswers = { ...currentAnswers };
                        if (newStep < 4) delete newAnswers.refinements;
                        if (newStep < 3) delete newAnswers.occasion;
                        if (newStep < 2) delete newAnswers.subMood;
                        return newAnswers;
                    });
                }

                // If leaving the result screen, clear the recommendation.
                if (stepRef.current === 5 && newStep !== 5) {
                    setRecommendation(null);
                }

                setStep(newStep);
                setIsFading(false);
                isTransitioningRef.current = false;
            }, 300);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [handleReset]);

    const fetchRecommendation = useCallback(async (currentAnswers: UserAnswers) => {
        setIsLoading(true);
        setLoadingMessage(undefined); // Use default loading message
        setError(null);

        try {
            const translatedAnswers = getTranslatedAnswer(currentAnswers);
            const result = await getMovieRecommendation(translatedAnswers, previousSuggestions, locale, preferences as UserPreferences);

            if (user && result.tmdbId) {
                addHistoryItem(result, currentAnswers);
            }
            setPreviousSuggestions(prev => [...prev, result.title]);
            setRecommendation(result); // Set state first
        } catch (err: any) {
            setError(t(err.message) || t('app.errorDefault'));
            window.location.hash = STEP_HASH_MAP[4];
        } finally {
            setIsLoading(false);
        }
    }, [previousSuggestions, locale, t, getTranslatedAnswer, preferences, user, addHistoryItem]);

    const handleNext = useCallback((data: PartialUserAnswers) => {
        const newAnswers = { ...answers, ...data };
        setAnswers(newAnswers);
        const nextStep = step + 1;

        if (nextStep > 4) {
            fetchRecommendation(newAnswers as UserAnswers);
        } else {
            window.location.hash = STEP_HASH_MAP[nextStep];
        }
    }, [answers, step, fetchRecommendation]);

    const handleBack = () => {
        window.history.back();
    };

    const handleSelectHistoryItem = useCallback(async (item: HistoryItem) => {
        setHistoryModalOpen(false);
        setIsLoading(true);
        setLoadingMessage(t('loadingScreen.revisiting'));
        setError(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 200));

            const tmdbDetails = await getMovieDetailsForHistory(item.tmdbId, item.title, locale);

            const reconstructedRec: MovieRecommendation = {
                title: tmdbDetails.title || item.title,
                year: item.year,
                posterPath: tmdbDetails.posterPath || item.posterPath,
                tmdbId: item.tmdbId,
                justifications: item.justifications,
                trailerSearchQuery: `${item.title} official trailer`,
                ...tmdbDetails,
            };

            setAnswers(item.userAnswers);
            setRecommendation(reconstructedRec); // Set state first

        } catch (err: any) {
            setError(t(err.message) || t('app.errorDefault'));
            // Stop loading but stay on current page to show error
            setIsLoading(false);
            setLoadingMessage(undefined);
        }
        // finally block removed to let the loading state be controlled by the error/success path
    }, [locale, t]);

    const handleTryAgain = () => {
        if (answers.mood && answers.subMood && answers.occasion && answers.refinements) {
            fetchRecommendation(answers as UserAnswers);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <MoodSelector onSelect={handleNext} />;
            case 2: return <SubMoodStep onNext={handleNext} onBack={handleBack} answers={answers} />;
            case 3: return <OccasionStep onNext={handleNext} onBack={handleBack} />;
            case 4: return <RefinementStep onNext={handleNext} onBack={handleBack} answers={answers} />;
            case 5:
                if (recommendation) {
                    return <RecommendationScreen recommendation={recommendation} answers={answers as UserAnswers} onTryAgain={handleTryAgain} onBack={handleBack} />;
                }
                // If we are on step 5 but have no recommendation (e.g., on page refresh), reset.
                handleReset();
                return null;
            default:
                // Should not happen, but as a fallback, reset.
                handleReset();
                return null;
        }
    };

    const renderAuthSection = () => {
        if (!isFirebaseEnabled) return null;
        if (authLoading) {
            return <div className="w-8 h-8 p-1"><div className="w-full h-full border-2 rounded-full border-surface border-t-accent animate-spin" /></div>;
        }
        if (user) {
            return (
                <>
                    <button onClick={() => setHistoryModalOpen(true)} className="p-1 rounded-full hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent" aria-label={t('auth.historyTitle')}>
                        <div className="w-6 h-6 text-text-primary"><HistoryIcon /></div>
                    </button>
                    <button onClick={() => setProfileModalOpen(true)} className="p-1 rounded-full hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent" aria-label={t('auth.profileTitle')}>
                        <div className="w-6 h-6 text-text-primary"><UserIcon /></div>
                    </button>
                </>
            );
        }
        return (
            <button onClick={() => setAuthModalOpen(true)} className="px-4 py-2 text-sm font-medium rounded-md text-text-primary bg-surface border border-primary hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent">
                {t('auth.login')}
            </button>
        );
    };

    return (
        <>
            {isLoading && <LoadingScreen message={loadingMessage} />}
            <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background overflow-hidden">
                <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                    <button
                        onClick={handleReset}
                        className="text-2xl font-bold transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-md p-1"
                        aria-label={t('app.resetAriaLabel')}
                    >
                        <span className="text-text-primary">{t('common.appName')}</span><span className="text-accent">{t('common.appNameAccent')}</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        {renderAuthSection()}
                    </div>
                </header>

                {error && (
                    <div className="absolute top-24 bg-red-500/80 text-white p-3 rounded-lg animate-fade-in mb-4 z-20">
                        <button onClick={() => setError(null)} className="absolute -top-1 -right-1 bg-red-700 p-0.5 rounded-full">&times;</button>
                        {error}
                    </div>
                )}
                <div className={`transition-opacity duration-300 ease-in-out w-full mt-20 sm:mt-0 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                    {renderStep()}
                </div>
            </main>

            {isFirebaseEnabled && <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />}
            {isFirebaseEnabled && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />}
            {isFirebaseEnabled && <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} onSelectItem={handleSelectHistoryItem} />}
        </>
    );
};

export default App;
