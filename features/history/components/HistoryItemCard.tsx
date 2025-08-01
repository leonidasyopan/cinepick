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
    // Add a defensive guard to prevent crashes from malformed history items.
    if (!item || !item.recommendation) {
        return null;
    }

    const { t } = useI18n();
    const { recommendation, watched, rating, recommendationDate: recDate } = item;
    const { tmdbId, title, year, posterPath } = recommendation;

    const posterUrl = posterPath ? `${IMAGE_BASE_URL}w500${posterPath}` : `https://picsum.photos/seed/${encodeURIComponent(title)}/500/750`;
    const recommendationDate = recDate?.toDate ? recDate.toDate().toLocaleDateString() : 'N/A';

    const handleInteraction = (e: React.MouseEvent, action: () => void) => {
        e.preventDefault(); // Prevent navigation from the parent link
        e.stopPropagation();
        action();
    };

    const handleWatchedToggle = () => {
        const newWatchedStatus = !watched;
        const updates: Partial<Pick<HistoryItem, 'watched' | 'rating'>> = { watched: newWatchedStatus };
        // If un-watching, also clear the rating
        if (!newWatchedStatus) {
            updates.rating = null;
        }
        if (typeof tmdbId === 'number') {
            onUpdate(tmdbId, updates);
        } else {
            throw new Error(`Invalid tmdbId: Expected a number but got ${typeof tmdbId}`);
        }
    };

    const handleRating = (newRating: 'liked' | 'disliked') => {
        // Only allow rating if watched
        if (!watched) return;
        // If same rating is clicked again, clear it. Otherwise, set it.
        const updatedRating = rating === newRating ? null : newRating;
        if (typeof tmdbId === 'number') {
            onUpdate(tmdbId, { rating: updatedRating });
        } else {
            throw new Error(`Invalid tmdbId: Expected a number but got ${typeof tmdbId}`);
        }
    };

    return (
        <a
            href={`#/history/view/${tmdbId}`}
            className="flex gap-4 p-3 bg-primary/50 rounded-lg w-full hover:bg-primary transition-colors duration-200 cursor-pointer"
            aria-label={`View details for ${title}`}
        >
            <img src={posterUrl} alt={title} className="w-20 h-auto object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow flex flex-col justify-between overflow-hidden">
                <div>
                    <h4 className="font-bold text-text-primary truncate">{title} ({year})</h4>
                    <p className="text-xs text-text-secondary">{t('auth.historyRecommendedOn', { date: recommendationDate })}</p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <label
                        className="flex items-center gap-2 cursor-pointer text-sm text-text-primary"
                        onClick={(e) => handleInteraction(e, handleWatchedToggle)}
                    >
                        <input
                            type="checkbox"
                            checked={item.watched}
                            readOnly
                            className="w-4 h-4 rounded bg-surface border-primary text-accent focus:ring-accent pointer-events-none"
                            aria-label={t('auth.historyWatched')}
                        />
                        {t('auth.historyWatched')}
                    </label>
                    <div className={`flex items-center gap-2 transition-opacity ${item.watched ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <button
                            onClick={(e) => handleInteraction(e, () => handleRating('liked'))}
                            aria-label="Liked recommendation"
                            className={`p-1.5 rounded-full transition-colors ${item.rating === 'liked' ? 'bg-green-500/30 text-green-400' : 'bg-surface hover:bg-surface/50 text-text-secondary hover:text-green-400'}`}
                        >
                            <ThumbsUpIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => handleInteraction(e, () => handleRating('disliked'))}
                            aria-label="Disliked recommendation"
                            className={`p-1.5 rounded-full transition-colors ${item.rating === 'disliked' ? 'bg-red-500/30 text-red-400' : 'bg-surface hover:bg-surface/50 text-text-secondary hover:text-red-400'}`}
                        >
                            <ThumbsDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </a>
    );
};