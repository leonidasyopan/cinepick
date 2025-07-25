
import React from 'react';
import { useI18n } from '../../../src/i18n/i18n';

const LoadingScreen: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
            <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
            <p className="text-2xl text-text-secondary font-semibold tracking-wider">{t('loadingScreen.message')}</p>
        </div>
    );
};

export default LoadingScreen;