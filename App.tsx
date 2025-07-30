
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserAnswers, PartialUserAnswers, MovieRecommendation, UserPreferences } from './features/recommendation/types';
import { getMovieRecommendation } from './features/recommendation/services/geminiService';
import { reFetchMovieDetails } from './features/recommendation/services/tmdbService';
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

const STEP_HASH_MAP: { [key: number]: string } = {
    1: 'mood',
    2: 'submood',
    3: 'occasion',
    4: 'refine',
    5: 'loading',
    6: 'result',
};

const HASH_STEP_MAP: { [key: string]: number } = Object.entries(STEP_HASH_MAP)
    .reduce((acc, [key, value]) => ({ ...acc, [value]: parseInt(key, 10) }), {});

const getStepFromHash = () => HASH_STEP_MAP[window.location.hash.substring(1)] || 1;

// This logic runs BEFORE the first render, during component initialization.
const initialStep = getStepFromHash();
// On a fresh load, the application state is always empty.
// Any step greater than 1 is therefore invalid.
const isInitialStateSufficient = initialStep <= 1;

const App: React.FC = () => {
    const { t, locale, getTranslatedAnswer } = useI18n();
    const { user, loading: authLoading, preferences, isFirebaseEnabled } = useAuth();
    const { addHistoryItem } = useHistory();

    const [step, setStep] = useState(isInitialStateSufficient ? initialStep : 1);
    const [answers, setAnswers] = useState<PartialUserAnswers>({});
    const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
    const [previousSuggestions, setPreviousSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);

    const answersRef = useRef(answers);
    answersRef.current = answers;
    const recommendationRef = useRef(recommendation);
    recommendationRef.current = recommendation;
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const stepRef = useRef(step);
    stepRef.current = step;
    const isTransitioningRef = useRef(false);
    const isProgrammaticNavigationRef = useRef(false);


    const handleReset = useCallback(() => {
        setIsFading(true);
        setTimeout(() => {
            setStep(1);
            setAnswers({});
            setRecommendation(null);
            setPreviousSuggestions([]);
            setError(null);
            setIsLoading(false);
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[1];
            setIsFading(false);
        }, 300);
    }, []);

    useEffect(() => {
        if (!isInitialStateSufficient) {
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[1];
        }

        const handleHashChange = () => {
            const wasProgrammatic = isProgrammaticNavigationRef.current;
            isProgrammaticNavigationRef.current = false;

            if (isTransitioningRef.current) return;

            const newStep = getStepFromHash();

            if (!wasProgrammatic) {
                const isStateSufficientForStep = (targetStep: number) => {
                    const currentAnswers = answersRef.current;
                    const currentRecommendation = recommendationRef.current;
                    const currentIsLoading = isLoadingRef.current;

                    if (targetStep <= 1) return true;
                    if (targetStep === 2) return !!currentAnswers.mood;
                    if (targetStep === 3) return !!currentAnswers.mood && !!currentAnswers.subMood;
                    if (targetStep === 4) return !!currentAnswers.mood && !!currentAnswers.subMood && !!currentAnswers.occasion;
                    if (targetStep === 5) return currentIsLoading;
                    if (targetStep === 6) return !!currentRecommendation;

                    return false;
                };

                if (!isStateSufficientForStep(newStep)) {
                    window.location.hash = STEP_HASH_MAP[1];
                    return;
                }
            }

            if (newStep === stepRef.current) return;

            isTransitioningRef.current = true;
            setIsFading(true);

            setTimeout(() => {
                if (newStep < stepRef.current) {
                    setAnswers(currentAnswers => {
                        const newAnswers: PartialUserAnswers = { ...currentAnswers };
                        if (newStep < 4) delete newAnswers.refinements;
                        if (newStep < 3) delete newAnswers.occasion;
                        if (newStep < 2) delete newAnswers.subMood;
                        return newAnswers;
                    });
                }

                if (stepRef.current === 6 && newStep !== 6) {
                    setRecommendation(null);
                }

                setStep(newStep);
                setIsFading(false);
                isTransitioningRef.current = false;
            }, 300);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);


    const fetchRecommendation = useCallback(async (currentAnswers: UserAnswers) => {
        setIsLoading(true);
        setError(null);
        isProgrammaticNavigationRef.current = true;
        window.location.hash = STEP_HASH_MAP[5];

        try {
            const translatedAnswers = getTranslatedAnswer(currentAnswers);
            const result = await getMovieRecommendation(translatedAnswers, previousSuggestions, locale, preferences as UserPreferences);
            setRecommendation(result);
            if (user && result.tmdbId) {
                addHistoryItem(result, currentAnswers);
            }
            setPreviousSuggestions(prev => [...prev, result.title]);
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[6];
        } catch (err: any) {
            setError(err.message || t('app.errorDefault'));
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[1];
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
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[nextStep];
        }
    }, [answers, step, fetchRecommendation]);

    const handleBack = () => {
        window.history.back();
    };

    const handleBackFromRecs = () => {
        isProgrammaticNavigationRef.current = true;
        window.location.hash = STEP_HASH_MAP[4];
    };

    const handleTryAgain = () => {
        if (answers.mood && answers.subMood && answers.occasion && answers.refinements) {
            fetchRecommendation(answers as UserAnswers);
        }
    };

    const handleSelectHistoryItem = useCallback(async (item: HistoryItem) => {
        setHistoryModalOpen(false);
        setIsFading(true);

        setTimeout(async () => {
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[5];
            setIsLoading(true);

            try {
                // Re-fetch details for the most up-to-date providers, etc.
                const tmdbDetails = await reFetchMovieDetails(item.tmdbId, item.title, locale);

                const reconstructedRec: MovieRecommendation = {
                    // Base data from history
                    title: tmdbDetails.title || item.title, // Prefer fresh title
                    year: item.year,
                    posterPath: tmdbDetails.posterPath || item.posterPath,
                    tmdbId: item.tmdbId,
                    justification: item.justification,
                    trailerSearchQuery: `${item.title} official trailer`, // Reconstruct a sensible default
                    // Fresh data from TMDb
                    ...tmdbDetails,
                };

                setRecommendation(reconstructedRec);
                setAnswers(item.userAnswers);

                isProgrammaticNavigationRef.current = true;
                window.location.hash = STEP_HASH_MAP[6];
            } catch (err: any) {
                setError(err.message || t('app.errorDefault'));
                isProgrammaticNavigationRef.current = true;
                window.location.hash = STEP_HASH_MAP[1];
            } finally {
                setIsLoading(false);
            }
        }, 300);
    }, [locale, t]);

    const renderStep = () => {
        switch (step) {
            case 1: return <MoodSelector onSelect={handleNext} />;
            case 2: return answers.mood ? <SubMoodStep onNext={handleNext} onBack={handleBack} answers={answers} /> : <LoadingScreen />;
            case 3: return answers.subMood ? <OccasionStep onNext={handleNext} onBack={handleBack} /> : <LoadingScreen />;
            case 4: return answers.occasion ? <RefinementStep onNext={handleNext} onBack={handleBack} answers={answers} /> : <LoadingScreen />;
            case 5: return <LoadingScreen />;
            case 6: return recommendation ? <RecommendationScreen recommendation={recommendation} answers={answers as UserAnswers} onTryAgain={handleTryAgain} onBack={handleBackFromRecs} /> : <LoadingScreen />;
            default:
                return <MoodSelector onSelect={handleNext} />;
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
            )
        }

        return (
            <button onClick={() => setAuthModalOpen(true)} className="px-4 py-2 text-sm font-medium rounded-md text-text-primary bg-surface border border-primary hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent">
                {t('auth.login')}
            </button>
        )
    }

    return (
        <>
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