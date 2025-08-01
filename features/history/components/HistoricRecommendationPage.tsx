import React from 'react';
import { useHistory } from '../HistoryContext';
import { RecommendationScreen } from '../../recommendation/components/RecommendationScreen';
import LoadingScreen from '../../recommendation/components/LoadingScreen';
import { useI18n } from '../../../src/i18n/i18n';

interface HistoricRecommendationPageProps {
  recommendationId: string;
}

const HistoricRecommendationPage: React.FC<HistoricRecommendationPageProps> = ({ recommendationId }) => {
  const { history, loading: historyLoading } = useHistory();
  const { t } = useI18n();

  if (historyLoading) {
    return <LoadingScreen />;
  }

  const numericId = parseInt(recommendationId, 10);
  const historyItem = history.find(item => item.recommendation && item.recommendation.tmdbId === numericId);

  if (!historyItem) {
    return (
      <div className="text-center animate-fade-in flex flex-col items-center gap-4">
        <p className="text-2xl text-text-secondary">{t('share.page.notFound')}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 bg-accent text-background hover:opacity-90 font-bold py-3 px-8 rounded-full transition-all duration-300"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const handleBack = () => {
    window.history.back();
  };

  return (
    <RecommendationScreen
      recommendation={historyItem.recommendation}
      answers={historyItem.userAnswers}
      onTryAgain={() => { }} // This will be hidden
      onBack={handleBack}
      showTryAgainButton={false}
    />
  );
};

export default HistoricRecommendationPage;