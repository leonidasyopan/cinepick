
import React, { ReactNode } from 'react';

interface StepContainerProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    onBack?: () => void;
}

const StepContainer: React.FC<StepContainerProps> = ({ children, title, subtitle, onBack }) => (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
        {onBack && (
            <div className="w-full text-left mb-2">
                 <button 
                    onClick={onBack} 
                    className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors duration-300 font-semibold p-2 rounded-lg -ml-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Go back to previous step"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                </button>
            </div>
        )}
        <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
                {title}
            </h2>
            {subtitle && (
                <p className="text-lg text-text-secondary mt-2">
                    {subtitle}
                </p>
            )}
        </div>
        {children}
    </div>
);

export default StepContainer;
