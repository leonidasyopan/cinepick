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
import HistoryModal from './features/history/components/HistoryModal';
import SharedRecommendationPage from './features/sharing/components/SharedRecommendationPage';
import HistoricRecommendationPage from './features/history/components/HistoricRecommendationPage';
import TasteOnboardingFlow from './features/taste/components/TasteOnboardingFlow';
import { useTaste } from './features/taste/TasteContext';


type AppRoute =
    | { page: 'main'; step: number }
    | { page: 'share'; id: string }
    | { page: 'view'; data: string }
    | { page: 'history-view'; id: string }
    | { page: 'onboarding' };


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


const getRoute = (): AppRoute => {
    const path = window.location.pathname;
    const hash = window.location.hash.substring(1); // remove #

    // Priority 1: Check for server-rendered share URLs (e.g., /share/xyz)
    const pathParts = path.split('/').filter(p => p);
    if (pathParts[0] === 'share' && pathParts[1]) {
        return { page: 'share', id: pathParts[1] };
    }

    // Priority 2: Check for hash-based routes for client-side navigation
    if (!hash) return { page: 'main', step: 1 };

    const hashParts = hash.split('/').filter(p => p);

    if (hashParts[0] === 'share' && hashParts[1]) {
        return { page: 'share', id: hashParts[1] };
    }

    if (hashParts[0] === 'history' && hashParts[1] === 'view' && hashParts[2]) {
        return { page: 'history-view', id: hashParts[2] };
    }

    if (hashParts[0] === 'onboarding') {
        return { page: 'onboarding' };
    }

    // Priority 3: Check for fallback client-side view URLs
    if (hashParts[0] === 'view' && hashParts[1]) {
        return { page: 'view', data: hashParts[1] };
    }

    const step = HASH_STEP_MAP[hashParts[0]] || 1;
    return { page: 'main', step };
};


// This logic runs BEFORE the first render, during component initialization.
const initialRoute = getRoute();
// On a fresh load, the application state is always empty.
// Any step greater than 1 is therefore invalid.
const isInitialMainFlowStateSufficient = initialRoute.page !== 'main' || initialRoute.step <= 1;

// Robust Base64 decoding for UTF-8 characters
const b64_to_utf8 = (str: string) => {
    try {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error("Base64 decoding failed:", e);
        return "";
    }
}

const App: React.FC = () => {
    const { t, locale, getTranslatedAnswer } = useI18n();
    const { user, loading: authLoading, preferences, isFirebaseEnabled } = useAuth();
    const { addHistoryItem } = useHistory();
    const { tastePreferences } = useTaste();

    const [route, setRoute] = useState<AppRoute>(isInitialMainFlowStateSufficient ? initialRoute : { page: 'main', step: 1 });
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
    const routeRef = useRef(route);
    routeRef.current = route;
    const isTransitioningRef = useRef(false);
    const isProgrammaticNavigationRef = useRef(false);


    const handleReset = useCallback(() => {
        setIsFading(true);
        setTimeout(() => {
            // Reset state
            setAnswers({});
            setRecommendation(null);
            setPreviousSuggestions([]);
            setError(null);
            setIsLoading(false);

            // Navigate to home
            isProgrammaticNavigationRef.current = true;
            // Use history.pushState to go to root without reloading, then set hash.
            window.history.pushState(null, '', '/');
            window.location.hash = STEP_HASH_MAP[1];

            // This will trigger the hashchange listener to set the route
            // setRoute({ page: 'main', step: 1 });

            setIsFading(false);
        }, 300);
    }, []);

    useEffect(() => {
        if (!isInitialMainFlowStateSufficient) {
            isProgrammaticNavigationRef.current = true;
            window.history.pushState(null, '', '/');
            window.location.hash = STEP_HASH_MAP[1];
        }

        const handleHashChange = () => {
            const wasProgrammatic = isProgrammaticNavigationRef.current;
            isProgrammaticNavigationRef.current = false;

            if (isTransitioningRef.current) return;

            const newRoute = getRoute();

            // If the route hasn't changed, do nothing.
            if (JSON.stringify(newRoute) === JSON.stringify(routeRef.current)) return;

            // No need to do state checks for self-contained pages
            if (newRoute.page !== 'main') {
                setRoute(newRoute);
                return;
            }

            // --- Logic for main flow ---
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

                if (!isStateSufficientForStep(newRoute.step)) {
                    isProgrammaticNavigationRef.current = true;
                    window.location.hash = STEP_HASH_MAP[1];
                    // The hash change will trigger this handler again, so we just return
                    return;
                }
            }

            if (routeRef.current.page === 'main' && newRoute.step === routeRef.current.step) return;

            isTransitioningRef.current = true;
            setIsFading(true);

            setTimeout(() => {
                if (routeRef.current.page === 'main' && newRoute.step < routeRef.current.step) {
                    setAnswers(currentAnswers => {
                        const newAnswers: PartialUserAnswers = { ...currentAnswers };
                        if (newRoute.step < 4) delete newAnswers.refinements;
                        if (newRoute.step < 3) delete newAnswers.occasion;
                        if (newRoute.step < 2) delete newAnswers.subMood;
                        return newAnswers;
                    });
                }

                if (routeRef.current.page === 'main' && routeRef.current.step === 6 && newRoute.step !== 6) {
                    setRecommendation(null);
                }

                setRoute(newRoute);
                setIsFading(false);
                isTransitioningRef.current = false;
            }, 300);
        };

        window.addEventListener('hashchange', handleHashChange);
        // Also listen for popstate to handle browser back/forward on path changes
        window.addEventListener('popstate', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('popstate', handleHashChange);
        };
    }, []);


    const fetchRecommendation = useCallback(async (currentAnswers: UserAnswers) => {
        setIsLoading(true);
        setError(null);
        isProgrammaticNavigationRef.current = true;
        window.location.hash = STEP_HASH_MAP[5];

        try {
            const translatedAnswers = getTranslatedAnswer(currentAnswers);
            const result = await getMovieRecommendation(
                translatedAnswers,
                previousSuggestions,
                locale,
                preferences as UserPreferences,
                tastePreferences
            );
            setRecommendation(result);
            if (user && result.tmdbId && isFirebaseEnabled) {
                addHistoryItem(result, currentAnswers);
            }
            setPreviousSuggestions(prev => [...prev, result.title]);
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[6];
        } catch (err: any) {
            setError(err.message || t('app.errorDefault'));
            handleReset(); // Go home on error
        } finally {
            setIsLoading(false);
        }
    }, [previousSuggestions, locale, t, getTranslatedAnswer, preferences, user, addHistoryItem, handleReset, isFirebaseEnabled, tastePreferences]);

    const handleNext = useCallback((data: PartialUserAnswers) => {
        const newAnswers = { ...answers, ...data };
        setAnswers(newAnswers);

        if (route.page !== 'main') return;
        const nextStep = route.step + 1;

        if (nextStep > 4) {
            fetchRecommendation(newAnswers as UserAnswers);
        } else {
            isProgrammaticNavigationRef.current = true;
            window.location.hash = STEP_HASH_MAP[nextStep];
        }
    }, [answers, route, fetchRecommendation]);

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

    const handleNewUser = () => {
        setAuthModalOpen(false);
        isProgrammaticNavigationRef.current = true;
        window.location.hash = 'onboarding';
    };

    const renderMainFlow = (step: number) => {
        switch (step) {
            case 1: return <MoodSelector onSelect={handleNext} />;
            case 2: return answers.mood ? <SubMoodStep onNext={handleNext} onBack={handleBack} answers={answers} /> : <LoadingScreen />;
            case 3: return answers.subMood ? <OccasionStep onNext={handleNext} onBack={handleBack} /> : <LoadingScreen />;
            case 4: return answers.occasion ? <RefinementStep onNext={handleNext} onBack={handleBack} answers={answers} /> : <LoadingScreen />;
            case 5: return <LoadingScreen />;
            case 6: return recommendation ? <RecommendationScreen recommendation={recommendation} answers={answers as UserAnswers} onTryAgain={handleTryAgain} onBack={handleBackFromRecs} /> : <LoadingScreen />;
            default:
                handleReset();
                return <LoadingScreen />;
        }
    };

    const renderPage = () => {
        switch (route.page) {
            case 'share':
                return <SharedRecommendationPage recommendationId={route.id} />;
            case 'view':
                try {
                    const jsonString = b64_to_utf8(route.data);
                    if (!jsonString) throw new Error("Decoded string is empty.");
                    const decodedData = JSON.parse(jsonString);
                    return <SharedRecommendationPage initialData={decodedData} />;
                } catch (e) {
                    console.error("Failed to decode share link", e);
                    setError(t('share.page.notFound'));
                    handleReset();
                    return <LoadingScreen />;
                }
            case 'history-view':
                return <HistoricRecommendationPage recommendationId={route.id} />;
            case 'onboarding':
                return <TasteOnboardingFlow onComplete={handleReset} />;
            case 'main':
                return renderMainFlow(route.step);
            default:
                handleReset();
                return <LoadingScreen />;
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
                    {renderPage()}
                </div>
            </main>

            {isFirebaseEnabled && <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onNewUser={handleNewUser} />}
            {isFirebaseEnabled && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />}
            {isFirebaseEnabled && <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} />}
        </>
    );
};

export default App;