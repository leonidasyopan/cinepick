import React from 'react';
import type { HistoryItem } from '../types';
import { IMAGE_BASE_URL } from '../../recommendation/services/tmdbService';
import { ThumbsUpIcon, ThumbsDownIcon } from '../../../components/icons';
import { useI18n } from '../../../src/i18n/i18n';

interface HistoryItemCardProps {
    item: HistoryItem;
    onUpdate: (tmdbId: number, updates: Partial<Pick<HistoryItem, 'watched' | 'rating'>>) => void;
}

export const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ item, onUpdate }) => {
    const { t } = useI18n();
    const posterUrl = item.posterPath ? `${IMAGE_BASE_URL}w500${item.posterPath}` : `https://picsum.photos/seed/${encodeURIComponent(item.title)}/500/750`;
    const recommendationDate = item.recommendationDate?.toDate ? item.recommendationDate.toDate().toLocaleDateString() : 'N/A';

    const handleWatchedToggle = () => {
        const newWatchedStatus = !item.watched;
        const updates: Partial<Pick<HistoryItem, 'watched' | 'rating'>> = { watched: newWatchedStatus };
        // If un-watching, also clear the rating
        if (!newWatchedStatus) {
            updates.rating = null;
        }
        onUpdate(item.tmdbId, updates);
    };

    const handleRating = (newRating: 'liked' | 'disliked') => {
        // Only allow rating if watched
        if (!item.watched) return;
        // If same rating is clicked again, clear it. Otherwise, set it.
        const updatedRating = item.rating === newRating ? null : newRating;
        onUpdate(item.tmdbId, { rating: updatedRating });
    };

    return (
        <div className="flex gap-4 p-3 bg-primary/50 rounded-lg w-full">
            <img src={posterUrl} alt={item.title} className="w-20 h-auto object-cover rounded-md" />
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <h4 className="font-bold text-text-primary">{item.title} ({item.year})</h4>
                    <p className="text-xs text-text-secondary">{t('auth.historyRecommendedOn', { date: recommendationDate })}</p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text-primary">
                        <input
                            type="checkbox"
                            checked={item.watched}
                            onChange={handleWatchedToggle}
                            className="w-4 h-4 rounded bg-surface border-primary text-accent focus:ring-accent"
                        />
                        {t('auth.historyWatched')}
                    </label>
                    <div className={`flex items-center gap-2 transition-opacity ${item.watched ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <button 
                            onClick={() => handleRating('liked')}
                            aria-label="Liked recommendation"
                            className={`p-1.5 rounded-full transition-colors ${item.rating === 'liked' ? 'bg-green-500/30 text-green-400' : 'bg-surface hover:bg-surface/50 text-text-secondary hover:text-green-400'}`}
                        >
                            <ThumbsUpIcon className="w-5 h-5" />
                        </button>
                         <button 
                            onClick={() => handleRating('disliked')}
                            aria-label="Disliked recommendation"
                            className={`p-1.5 rounded-full transition-colors ${item.rating === 'disliked' ? 'bg-red-500/30 text-red-400' : 'bg-surface hover:bg-surface/50 text-text-secondary hover:text-red-400'}`}
                        >
                            <ThumbsDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
