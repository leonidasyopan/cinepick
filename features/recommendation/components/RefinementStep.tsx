import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PartialUserAnswers } from '../types';
import { DETAILED_GENRE_REFINEMENTS } from '../constants';
import StepContainer from '../../../components/StepContainer';
import { useI18n } from '../../../src/i18n/i18n';

interface RefinementSwitchProps {
    optionA: string;
    optionB: string;
    description: string;
    onChange: (selectedValue: string) => void;
    initialValueKey: string;
}

const RefinementSwitch: React.FC<RefinementSwitchProps> = ({ optionA, optionB, description, onChange, initialValueKey }) => {
    const [isBSelected, setIsBSelected] = useState(false);

    useEffect(() => {
        onChange(initialValueKey);
    }, [initialValueKey, onChange]);

    const handleToggle = () => {
        setIsBSelected(prev => !prev);
        const newValueKey = !isBSelected ? optionB.split('.').slice(-1)[0] : optionA.split('.').slice(-1)[0];
        const baseKey = optionA.substring(0, optionA.lastIndexOf('.'));
        onChange(`${baseKey}.${newValueKey}`);
    };

    const { t } = useI18n();
    const translatedOptionA = t(optionA);
    const translatedOptionB = t(optionB);
    const translatedDescription = t(description);

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-1 my-2">
            <div className="flex items-center justify-between w-full gap-4">
                <span className={`text-right w-2/5 font-medium transition-colors duration-300 ${!isBSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {translatedOptionA}
                </span>
                <button
                    onClick={handleToggle}
                    className="w-16 h-8 flex-shrink-0 bg-surface rounded-full p-1 flex items-center transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent"
                    role="switch"
                    aria-checked={isBSelected}
                    aria-label={`Switch between ${translatedOptionA} and ${translatedOptionB}`}
                >
                    <span className={`w-6 h-6 bg-accent rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isBSelected ? 'translate-x-8' : 'translate-x-0'}`} />
                </button>
                <span className={`text-left w-2/5 font-medium transition-colors duration-300 ${isBSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {translatedOptionB}
                </span>
            </div>
            <p className="text-xs text-text-secondary italic mt-1 px-2">{translatedDescription}</p>
        </div>
    );
};


interface RefinementStepProps {
    onNext: (data: PartialUserAnswers) => void;
    onBack: () => void;
    answers: PartialUserAnswers;
};

const RefinementStep: React.FC<RefinementStepProps> = ({ onNext, onBack, answers }) => {
    const { t } = useI18n();

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

    const handleSelectionChange = useCallback((index: number, valueKey: string) => {
        setSelections(currentSelections => {
            const newSelections = [...currentSelections];
            newSelections[index] = valueKey;
            return newSelections;
        });
    }, []);

    const handleFindMovie = () => {
        onNext({ refinements: selections });
    };

    if (refinementPairs.length === 0) {
        return (
            <StepContainer title={t('refinementStep.title')} onBack={onBack}>
                <p className="text-text-secondary">{t('refinementStep.error')}</p>
            </StepContainer>
        )
    }

    return (
        <StepContainer title={t('refinementStep.title')} subtitle={t('refinementStep.subtitle')} onBack={onBack}>
            <div className="flex flex-col items-center gap-6 mb-8">
                {refinementPairs.map((pair, index) => (
                    <RefinementSwitch
                        key={index}
                        optionA={pair.optionA}
                        optionB={pair.optionB}
                        description={pair.description}
                        onChange={(valueKey) => handleSelectionChange(index, valueKey)}
                        initialValueKey={pair.optionA}
                    />
                ))}
            </div>
            <div className="text-center">
                <button
                    onClick={handleFindMovie}
                    disabled={selections.length !== refinementPairs.length}
                    className="bg-accent hover:opacity-90 text-background font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {t('refinementStep.button')}
                </button>
            </div>
        </StepContainer>
    );
};

export default RefinementStep;