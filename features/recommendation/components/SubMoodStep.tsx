
import React from 'react';
import { PartialUserAnswers } from '../types';
import { SUB_MOODS } from '../constants';
import StepContainer from '../../../components/StepContainer';
import { useI18n } from '../../../src/i18n/i18n';

interface SubMoodStepProps {
    onNext: (data: PartialUserAnswers) => void;
    onBack: () => void;
    answers: PartialUserAnswers;
};

const SubMoodStep: React.FC<SubMoodStepProps> = ({ onNext, onBack, answers }) => {
    const { t } = useI18n();
    const moodLabel = answers.mood ? t(`moods.${answers.mood}.label`) : '';
    
    return (
        <StepContainer title={t('subMoodStep.title', { mood: moodLabel })} onBack={onBack}>
            <div className="flex flex-col items-center gap-4">
                {SUB_MOODS[answers.mood!]?.map((subMood) => (
                    <button
                        key={subMood.id}
                        onClick={() => onNext({ subMood: subMood.id })}
                        className="w-full max-w-md bg-primary hover:bg-accent text-text-primary font-semibold py-3 px-6 rounded-full shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
                    >
                        {t(subMood.labelKey)}
                    </button>
                ))}
            </div>
        </StepContainer>
    );
};

export default SubMoodStep;