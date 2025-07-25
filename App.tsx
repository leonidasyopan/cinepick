
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserAnswers, PartialUserAnswers, MovieRecommendation } from './features/recommendation/types';
import { getMovieRecommendation } from './features/recommendation/services/geminiService';
import { RecommendationScreen } from './features/recommendation/components/RecommendationScreen';
import MoodSelector from './features/recommendation/components/MoodSelector';
import SubMoodStep from './features/recommendation/components/SubMoodStep';
import OccasionStep from './features/recommendation/components/OccasionStep';
import RefinementStep from './features/recommendation/components/RefinementStep';
import LoadingScreen from './features/recommendation/components/LoadingScreen';
import { LanguageSwitcher } from './src/components/LanguageSwitcher';
import { useI18n } from './src/i18n/i18n';

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
    // Initialize step state based on the pre-render check for a safe first render.
    const [step, setStep] = useState(isInitialStateSufficient ? initialStep : 1);
    const [answers, setAnswers] = useState<PartialUserAnswers>({});
    const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
    const [previousSuggestions, setPreviousSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);

    // Refs to hold current state for access inside useEffect without dependencies
    const answersRef = useRef(answers);
    answersRef.current = answers;
    const recommendationRef = useRef(recommendation);
    recommendationRef.current = recommendation;
    const isLoadingRef = useRef(isLoading);
    isLoadingRef.current = isLoading;
    const stepRef = useRef(step);
    stepRef.current = step;
    const isTransitioningRef = useRef(false);


    const handleReset = useCallback(() => {
        setIsFading(true);
        setTimeout(() => {
            setStep(1);
            setAnswers({});
            setRecommendation(null);
            setPreviousSuggestions([]);
            setError(null);
            setIsLoading(false);
            window.location.hash = STEP_HASH_MAP[1];
            setIsFading(false);
        }, 300);
    }, []);

    useEffect(() => {
        // On first mount, if the initial step was invalid, the state is already set to 1.
        // Now, we correct the URL hash to match the state, completing the redirect.
        if (!isInitialStateSufficient) {
            window.location.hash = STEP_HASH_MAP[1];
        }

        const handleHashChange = () => {
            if (isTransitioningRef.current) return;

            const newStep = getStepFromHash();
            const currentStep = stepRef.current;

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
                if (window.location.hash !== `#${STEP_HASH_MAP[1]}`) {
                    window.location.hash = STEP_HASH_MAP[1];
                } else if (currentStep !== 1) {
                    setStep(1);
                }
                return;
            }

            if (newStep === currentStep) return;

            isTransitioningRef.current = true;
            setIsFading(true);

            setTimeout(() => {
                if (newStep < currentStep) {
                    setAnswers(currentAnswers => {
                        const newAnswers: PartialUserAnswers = { ...currentAnswers };
                        if (newStep < 4) delete newAnswers.refinements;
                        if (newStep < 3) delete newAnswers.occasion;
                        if (newStep < 2) delete newAnswers.subMood;
                        return newAnswers;
                    });
                }

                if (currentStep === 6 && newStep !== 6) {
                    setRecommendation(null);
                }

                setStep(newStep);
                setIsFading(false);
                isTransitioningRef.current = false;
            }, 300);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []); // Empty dependency array is intentional to set up a single global listener


    const fetchRecommendation = useCallback(async (currentAnswers: UserAnswers) => {
        setIsLoading(true);
        setError(null);
        window.location.hash = STEP_HASH_MAP[5];

        try {
            const translatedAnswers = getTranslatedAnswer(currentAnswers);
            const result = await getMovieRecommendation(translatedAnswers, previousSuggestions, locale);
            setRecommendation(result);
            setPreviousSuggestions(prev => [...prev, result.title]);
            window.location.hash = STEP_HASH_MAP[6];
        } catch (err: any) {
            setError(err.message || t('app.errorDefault'));
            window.location.hash = STEP_HASH_MAP[1];
        } finally {
            setIsLoading(false);
        }
    }, [previousSuggestions, locale, t, getTranslatedAnswer]);

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

    const handleBackFromRecs = () => {
        window.location.hash = STEP_HASH_MAP[4];
    };

    const handleTryAgain = () => {
        if (answers.mood && answers.subMood && answers.occasion && answers.refinements) {
            fetchRecommendation(answers as UserAnswers);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <MoodSelector onSelect={handleNext} />;
            case 2: return answers.mood ? <SubMoodStep onNext={handleNext} onBack={handleBack} answers={answers} /> : <LoadingScreen />;
            case 3: return answers.subMood ? <OccasionStep onNext={handleNext} onBack={handleBack} /> : <LoadingScreen />;
            case 4: return answers.occasion ? <RefinementStep onNext={handleNext} onBack={handleBack} answers={answers} /> : <LoadingScreen />;
            case 5: return <LoadingScreen />;
            case 6: return recommendation ? <RecommendationScreen recommendation={recommendation} answers={answers as UserAnswers} onTryAgain={handleTryAgain} onBack={handleBackFromRecs} /> : <LoadingScreen />;
            default:
                // This default case handles the safe initial render before the effect runs.
                return <MoodSelector onSelect={handleNext} />;
        }
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background overflow-hidden">
            <header className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                <button
                    onClick={handleReset}
                    className="text-2xl font-bold transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-md p-1"
                    aria-label={t('app.resetAriaLabel')}
                >
                    <span className="text-text-primary">{t('common.appName')}</span><span className="text-accent">{t('common.appNameAccent')}</span>
                </button>
                <LanguageSwitcher />
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
    );
};

export default App;
