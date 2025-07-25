
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { UserAnswers, TranslatedUserAnswers } from '../../features/recommendation/types';

// Helper to get nested values from object by string path
const get = (obj: any, path: string, fallback: string = '') => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            return fallback;
        }
    }
    return result;
};

type Language = 'en-us' | 'es-es' | 'pt-br';

export const supportedLanguages: { code: Language; name: string }[] = [
    { code: 'en-us', name: 'English (US)' },
    { code: 'es-es', name: 'Español (ES)' },
    { code: 'pt-br', name: 'Português (BR)' },
];

interface I18nContextType {
    locale: Language;
    setLocale: (locale: Language) => void;
    t: (key: string, replacements?: Record<string, string>) => string;
    getTranslatedAnswer: (answers: UserAnswers) => TranslatedUserAnswers;
    getTimeOfDayTerm: () => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Language>('en-us');
    const [translations, setTranslations] = useState<any>({});

    useEffect(() => {
        const determineAndSetLocale = async () => {
            // 1. Check localStorage first (user's explicit choice)
            const savedLocale = localStorage.getItem('locale');
            if (savedLocale && supportedLanguages.some(l => l.code === savedLocale)) {
                setLocale(savedLocale as Language);
                return;
            }

            // No longer using IP API as it causes 403 errors
            // Instead, rely primarily on browser language settings which is more reliable
            // and respects user preferences without making external API calls

            // 3. Fallback to browser language if geolocation fails or doesn't match a rule
            const browserLang = navigator.language.toLowerCase();
            const matchedLocale = supportedLanguages.find(l => browserLang.startsWith(l.code.split('-')[0]));
            if (matchedLocale) {
                setLocale(matchedLocale.code);
                return;
            }

            // 4. Default to English
            setLocale('en-us');
        };

        determineAndSetLocale();
    }, []);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                // Updated path to use the public directory which is correctly served in both dev and production
                const response = await fetch(`/i18n/locales/${locale}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to load translations for ${locale}`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error('Translation loading error:', error);
                // Fallback to English if the desired locale fails
                if (locale !== 'en-us') {
                    setLocale('en-us');
                }
            }
        };

        fetchTranslations();
        localStorage.setItem('locale', locale);
    }, [locale]);

    const t = useCallback((key: string, replacements: Record<string, string> = {}): string => {
        let translation = get(translations, key, key);
        if (typeof translation !== 'string') return key;

        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        return translation;
    }, [translations]);

    const getTranslatedAnswer = useCallback((answers: UserAnswers): TranslatedUserAnswers => {
        const { mood, subMood, occasion, refinements } = answers;
        return {
            mood: t(`moods.${mood}.label`),
            subMood: t(`moods.${mood}.subMoods.${subMood}`),
            occasion: t(`occasions.${occasion}`),
            refinements: refinements.map(refKey => t(refKey)),
        };
    }, [t]);

    const getTimeOfDayKey = (): string => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    };

    const getTimeOfDayTerm = useCallback((): string => {
        const key = getTimeOfDayKey();
        return t(`timeOfDay.${key}`);
    }, [t]);


    const value = { locale, setLocale, t, getTranslatedAnswer, getTimeOfDayTerm };

    // Prevent rendering children until translations are loaded
    if (!translations || Object.keys(translations).length === 0) {
        return React.createElement('div', {
            className: "w-screen h-screen flex items-center justify-center bg-background"
        }, React.createElement('div', {
            className: "w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"
        }));
    }

    return React.createElement(I18nContext.Provider, { value: value }, children);
};

export const useI18n = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};