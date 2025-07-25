/*
import React from 'react';
import { PartialUserAnswers } from '../types';
import { GENRES } from '../constants';
import StepContainer from './StepContainer';

interface GenreStepProps {
    onNext: (data: PartialUserAnswers) => void;
    onBack: () => void;
};

const GenreStep: React.FC<GenreStepProps> = ({ onNext, onBack }) => (
    <StepContainer title="Craving a specific genre?" onBack={onBack}>
        <div className="flex flex-wrap justify-center gap-3">
            {GENRES.map((genre) => (
                <button
                    key={genre}
                    onClick={() => onNext({ genre })}
                    className="bg-surface hover:bg-primary text-text-primary font-semibold py-2 px-5 border border-primary/50 hover:border-transparent rounded-full transition-all duration-300"
                >
                    {genre}
                </button>
            ))}
            <button
                onClick={() => onNext({ genre: 'No Preference' })}
                className="bg-primary hover:bg-accent text-text-primary font-bold py-2 px-6 rounded-full transition-all duration-300 col-span-full mt-4"
            >
                No Preference
            </button>
        </div>
    </StepContainer>
);

export default GenreStep;
*/