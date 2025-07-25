
import React, { useState, useEffect, useMemo } from 'react';
import { PartialUserAnswers } from '../types';
import { DETAILED_GENRE_REFINEMENTS } from '../constants';
import StepContainer from '../../../components/StepContainer';

interface RefinementSwitchProps {
    optionA: string;
    optionB: string;
    description: string;
    onChange: (selectedValue: string) => void;
}

const RefinementSwitch: React.FC<RefinementSwitchProps> = ({ optionA, optionB, description, onChange }) => {
    const [selection, setSelection] = useState<'A' | 'B'>('A');

    const handleToggle = () => {
        const newSelection = selection === 'A' ? 'B' : 'A';
        setSelection(newSelection);
        onChange(newSelection === 'A' ? optionA : optionB);
    };
    
    const isASelected = selection === 'A';

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-1 my-2">
            <div className="flex items-center justify-between w-full gap-4">
                <span className={`text-right w-2/5 font-medium transition-colors duration-300 ${isASelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {optionA}
                </span>
                <button
                    onClick={handleToggle}
                    className="w-16 h-8 flex-shrink-0 bg-primary rounded-full p-1 flex items-center transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent"
                    role="switch"
                    aria-checked={!isASelected}
                    aria-label={`Switch between ${optionA} and ${optionB}`}
                >
                    <span className={`w-6 h-6 bg-accent rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isASelected ? 'translate-x-0' : 'translate-x-8'}`} />
                </button>
                <span className={`text-left w-2/5 font-medium transition-colors duration-300 ${!isASelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {optionB}
                </span>
            </div>
            <p className="text-xs text-text-secondary italic mt-1 px-2">{description}</p>
        </div>
    );
};


interface GenreStepProps {
    onNext: (data: PartialUserAnswers) => void;
    onBack: () => void;
    answers: PartialUserAnswers;
};

const GenreStep: React.FC<GenreStepProps> = ({ onNext, onBack, answers }) => {
    
    const refinementPairs = useMemo(() => {
        if (answers.mood && answers.subMood && answers.occasion) {
            return DETAILED_GENRE_REFINEMENTS[answers.mood]?.[answers.subMood]?.[answers.occasion] || [];
        }
        return [];
    }, [answers.mood, answers.subMood, answers.occasion]);

    const [selections, setSelections] = useState<string[]>([]);

    useEffect(() => {
        if (refinementPairs.length > 0) {
            setSelections(refinementPairs.map(p => p.optionA));
        }
    }, [refinementPairs]);

    const handleSelectionChange = (index: number, value: string) => {
        const newSelections = [...selections];
        newSelections[index] = value;
        setSelections(newSelections);
    };

    const handleFindMovie = () => {
        onNext({ refinements: selections });
    };

    if (refinementPairs.length === 0) {
        return (
             <StepContainer title="Refine your choice" onBack={onBack}>
                <p className="text-text-secondary">Could not determine refinement options. Please go back and try again.</p>
             </StepContainer>
        )
    }

    return (
        <StepContainer title="Refine your choice" subtitle="A few more details to find the perfect match." onBack={onBack}>
            <div className="flex flex-col items-center gap-6 mb-8">
                {refinementPairs.map((pair, index) => (
                    <RefinementSwitch 
                        key={`${pair.optionA}-${pair.optionB}`}
                        optionA={pair.optionA}
                        optionB={pair.optionB}
                        description={pair.description}
                        onChange={(value) => handleSelectionChange(index, value)}
                    />
                ))}
            </div>
            <button
                onClick={handleFindMovie}
                disabled={selections.length !== refinementPairs.length}
                className="bg-accent hover:bg-primary text-text-primary font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Find My Movie
            </button>
        </StepContainer>
    );
};

export default GenreStep;