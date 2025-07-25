
import React from 'react';
import { PartialUserAnswers } from '../types';
import { OCCASIONS } from '../constants';
import StepContainer from '../../../components/StepContainer';
import { useI18n } from '../../../src/i18n/i18n';

interface OccasionStepProps {
    onNext: (data: PartialUserAnswers) => void;
    onBack: () => void;
};

const OccasionStep: React.FC<OccasionStepProps> = ({ onNext, onBack }) => {
    const { t } = useI18n();
    
    return (
        <StepContainer title={t('occasionStep.title')} onBack={onBack}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {OCCASIONS.map((occasion) => (
                    <button
                        key={occasion.id}
                        onClick={() => onNext({ occasion: occasion.id })}
                        className="group bg-surface/50 hover:bg-surface border border-primary/50 p-4 rounded-xl shadow-lg transform hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col items-center gap-3"
                    >
                        <div className="w-12 h-12 text-accent group-hover:text-text-primary transition-colors duration-300">{occasion.icon}</div>
                        <span className="text-md font-semibold text-center text-text-primary">{t(occasion.labelKey)}</span>
                    </button>
                ))}
            </div>
        </StepContainer>
    );
};

export default OccasionStep;