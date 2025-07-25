
import React, { useState, useRef, useEffect } from 'react';
import { useI18n, supportedLanguages } from '../i18n/i18n';

const FlagIcon: React.FC<{ locale: string }> = ({ locale }) => {
    const countryCode = locale.split('-')[1].toUpperCase();
    return <span className={`fi fi-${countryCode.toLowerCase()} mr-2`}></span>;
}

export const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (langCode: 'en-us' | 'es-es' | 'pt-br') => {
        setLocale(langCode);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-primary bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded="true"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <FlagIcon locale={locale} />
                    {locale.split('-')[0].toUpperCase()}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div
                className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-surface ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
            >
                <div className="py-1" role="none">
                    {supportedLanguages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`${locale === lang.code ? 'bg-primary text-text-primary' : 'text-text-secondary'} group flex items-center w-full px-4 py-2 text-sm hover:bg-primary hover:text-text-primary`}
                            role="menuitem"
                        >
                             <FlagIcon locale={lang.code} />
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
