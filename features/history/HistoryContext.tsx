import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { addRecommendationToHistory, getUserHistory, updateHistoryItemStatus } from './services/historyService';
import type { HistoryItem } from './types';
import type { MovieRecommendation, UserAnswers } from '../recommendation/types';

interface HistoryContextType {
    history: HistoryItem[];
    loading: boolean;
    addHistoryItem: (recommendation: MovieRecommendation, answers: UserAnswers) => Promise<void>;
    updateHistoryItem: (tmdbId: number, updates: Partial<Pick<HistoryItem, 'watched' | 'rating'>>) => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getUserHistory(user.uid)
                .then(setHistory)
                .finally(() => setLoading(false));
        } else {
            setHistory([]);
            setLoading(false);
        }
    }, [user]);

    const addHistoryItem = useCallback(async (recommendation: MovieRecommendation, answers: UserAnswers) => {
        if (!user || !recommendation.tmdbId) return;
        await addRecommendationToHistory(user.uid, recommendation, answers);
        // Refresh history
        const newHistory = await getUserHistory(user.uid);
        setHistory(newHistory);
    }, [user]);

    const updateHistoryItem = useCallback(async (tmdbId: number, updates: Partial<Pick<HistoryItem, 'watched' | 'rating'>>) => {
        if (!user) return;
        
        // Optimistic update
        setHistory(currentHistory => currentHistory.map(item => 
            item.tmdbId === tmdbId ? { ...item, ...updates } : item
        ));
        
        try {
            await updateHistoryItemStatus(user.uid, tmdbId, updates);
        } catch (error) {
            console.error("Failed to update history item, reverting.", error);
            // Revert on failure
            const originalHistory = await getUserHistory(user.uid);
            setHistory(originalHistory);
        }
    }, [user]);

    const value = { history, loading, addHistoryItem, updateHistoryItem };

    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = (): HistoryContextType => {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};
