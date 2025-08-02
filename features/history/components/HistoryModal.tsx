import React from 'react';
import Modal from '../../../components/Modal';
import { useHistory } from '../HistoryContext';
import { useI18n } from '../../../src/i18n/i18n';
import { HistoryItemCard } from './HistoryItemCard';
import { DeprecatedHistoryItemCard } from './DeprecatedHistoryItemCard';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const { history, loading, updateHistoryItem } = useHistory();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('auth.historyTitle')} sizeClass="max-w-md lg:max-w-2xl">
            <div className="max-h-[60vh] overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <div className="w-8 h-8 border-2 rounded-full border-surface border-t-accent animate-spin" />
                    </div>
                )}
                {!loading && history.length === 0 && (
                    <p className="text-center text-text-secondary py-10">{t('auth.historyEmpty')}</p>
                )}
                {!loading && history.length > 0 && (
                    history
                        .filter(item => item && item.recommendation)
                        .map(item => {
                            if (item.recommendation.tmdbId) {
                                return <HistoryItemCard key={item.recommendation.tmdbId} item={item} onUpdate={updateHistoryItem} />;
                            }
                            // Using movie title and date as a fallback key. Firestore Timestamps are unique enough.
                            const key = `${item.recommendation.title}-${item.recommendationDate?.seconds || new Date().toISOString()}`;
                            return <DeprecatedHistoryItemCard key={key} item={item} />;
                        })
                )}
            </div>
        </Modal>
    );
};

export default HistoryModal;
