import React from 'react';

const LoadingScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="w-16 h-16 border-4 border-t-4 border-t-accent border-surface rounded-full animate-spin"></div>
        <p className="text-2xl text-text-secondary font-semibold tracking-wider">Finding your perfect pick...</p>
    </div>
);

export default LoadingScreen;
