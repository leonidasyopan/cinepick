
import React from 'react';
import { useI18n } from '../../../src/i18n/i18n';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
    const { t } = useI18n();

    const displayMessage = message || t('loadingScreen.message');

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in"
            role="alert"
            aria-live="assertive"
            aria-busy="true"
        >
            <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
            <p className="text-2xl text-text-secondary font-semibold tracking-wider mt-6 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
                {displayMessage}
            </p>
        </div>
    );
};

export default LoadingScreen;
