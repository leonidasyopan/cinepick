import React from 'react';
import { PartialUserAnswers } from '../types';
import { SUB_MOODS } from '../constants';
import StepContainer from '../../../components/StepContainer';

interface SubMoodStepProps {
    onNext: (data: PartialUserAnswers) => void;
    onBack: () => void;
    answers: PartialUserAnswers;
};

const SubMoodStep: React.FC<SubMoodStepProps> = ({ onNext, onBack, answers }) => (
    <StepContainer title={`What kind of "${answers.mood}"?`} onBack={onBack}>
        <div className="flex flex-col items-center gap-4">
            {SUB_MOODS[answers.mood!]?.map((subMood) => (
                <button
                    key={subMood.id}
                    onClick={() => onNext({ subMood: subMood.id })}
                    className="w-full max-w-md bg-primary hover:bg-accent text-text-primary font-semibold py-3 px-6 rounded-full shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
                >
                    {subMood.label}
                </button>
            ))}
        </div>
    </StepContainer>
);

export default SubMoodStep;
