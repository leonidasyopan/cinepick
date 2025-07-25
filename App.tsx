
import React, { useState, useCallback, useEffect } from 'react';
import { UserAnswers, PartialUserAnswers, MovieRecommendation } from './features/recommendation/types';
import { getMovieRecommendation } from './features/recommendation/services/geminiService';
import { RecommendationScreen } from './features/recommendation/components/RecommendationScreen';
import MoodSelector from './features/recommendation/components/MoodSelector';
import SubMoodStep from './features/recommendation/components/SubMoodStep';
import OccasionStep from './features/recommendation/components/OccasionStep';
import GenreStep from './features/recommendation/components/GenreStep';
import LoadingScreen from './features/recommendation/components/LoadingScreen';

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


const App: React.FC = () => {
    const [step, setStep] = useState(getStepFromHash());
    const [answers, setAnswers] = useState<PartialUserAnswers>({});
    const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
    const [previousSuggestions, setPreviousSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);

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
        const handleHashChange = () => {
            const newStep = getStepFromHash();
            setStep(currentStep => {
                if (newStep === currentStep) {
                    return currentStep;
                }

                setIsFading(true);
                setTimeout(() => {
                    if (newStep === 1) {
                        setAnswers({});
                        setRecommendation(null);
                        setPreviousSuggestions([]);
                        setError(null);
                        setIsLoading(false);
                    } else {
                        setAnswers(currentAnswers => {
                            const newAnswers: PartialUserAnswers = { ...currentAnswers };
                            if (newStep < 4) delete newAnswers.refinements;
                            if (newStep < 3) delete newAnswers.occasion;
                            if (newStep < 2) delete newAnswers.subMood;
                            return newAnswers;
                        });
                    }
                    // This is the key fix for the race condition on "Try Again"
                    // We don't want to nullify the recommendation if we are just starting a new search from the results page.
                    if (!(currentStep === 6 && newStep === 5) && newStep < 6) {
                        setRecommendation(null);
                    }
                    setIsFading(false);
                }, 300);

                return newStep;
            });
        };

        window.addEventListener('hashchange', handleHashChange);
        if (!window.location.hash || window.location.hash ==='#') {
            window.location.hash = STEP_HASH_MAP[1];
        }
        
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);


    const fetchRecommendation = useCallback(async (currentAnswers: UserAnswers) => {
        setIsLoading(true);
        setError(null);
        window.location.hash = STEP_HASH_MAP[5];

        try {
            const result = await getMovieRecommendation(currentAnswers, previousSuggestions);
            setRecommendation(result);
            setPreviousSuggestions(prev => [...prev, result.title]);
            window.location.hash = STEP_HASH_MAP[6];
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            window.location.hash = STEP_HASH_MAP[1];
        } finally {
            setIsLoading(false);
        }
    }, [previousSuggestions]);

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
            case 2: return <SubMoodStep onNext={handleNext} onBack={handleBack} answers={answers} />;
            case 3: return <OccasionStep onNext={handleNext} onBack={handleBack} />;
            case 4: return <GenreStep onNext={handleNext} onBack={handleBack} answers={answers} />;
            case 5: return <LoadingScreen />;
            case 6: return recommendation ? <RecommendationScreen recommendation={recommendation} answers={answers as UserAnswers} onTryAgain={handleTryAgain} onBack={handleBackFromRecs} /> : <LoadingScreen />;
            default:
                return <MoodSelector onSelect={handleNext} />;
        }
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-background overflow-hidden">
             <button
                onClick={handleReset}
                className="absolute top-6 left-6 text-2xl font-bold z-20 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-md p-1"
                aria-label="Go to homepage and start over"
            >
                <span className="text-text-primary">Cine</span><span className="text-accent">Pick</span>
            </button>
            {error && (
                <div className="absolute top-20 bg-red-500/80 text-white p-3 rounded-lg animate-fade-in mb-4 z-20">
                    {error}
                </div>
            )}
            <div className={`transition-opacity duration-300 ease-in-out w-full ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                {renderStep()}
            </div>
        </main>
    );
};

export default App;
