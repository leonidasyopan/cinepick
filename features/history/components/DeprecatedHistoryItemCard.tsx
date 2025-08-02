import React from 'react';
import type { HistoryItem } from '../types';
import { useI18n } from '../../../src/i18n/i18n';

interface DeprecatedHistoryItemCardProps {
  item: HistoryItem;
}

export const DeprecatedHistoryItemCard: React.FC<DeprecatedHistoryItemCardProps> = ({ item }) => {
  const { t } = useI18n();
  const { recommendation } = item;
  const { title, year } = recommendation;
  const recommendationDate = item.recommendationDate?.toDate ? item.recommendationDate.toDate().toLocaleDateString() : 'N/A';

  return (
    <div
      className="flex gap-4 p-3 bg-primary/30 rounded-lg w-full cursor-not-allowed opacity-60"
      aria-label={`Deprecated recommendation: ${title}`}
    >
      <div className="w-20 h-auto flex-shrink-0 bg-surface rounded-md flex items-center justify-center aspect-[2/3]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </div>
      <div className="flex-grow flex flex-col justify-center overflow-hidden">
        <div>
          <h4 className="font-bold text-text-primary truncate">{title} ({year})</h4>
          <p className="text-xs text-text-secondary">{t('auth.historyRecommendedOn', { date: recommendationDate })}</p>
        </div>
        <div className="mt-2">
          <p className="text-xs text-amber-400/80 italic">{t('history.deprecatedItem')}</p>
        </div>
      </div>
    </div>
  );
};
