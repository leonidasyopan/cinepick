import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { useAuth } from '../AuthContext';
import { useI18n } from '../../../src/i18n/i18n';
import type { UserPreferences } from '../../recommendation/types';
import { useTaste } from '../../taste/TasteContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const { user, preferences, updateUserPreferences, logout } = useAuth();
    const { tastePreferences, totalMoviesInGame } = useTaste();
    const [localPrefs, setLocalPrefs] = useState<Partial<UserPreferences>>(preferences);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setLocalPrefs(preferences);
    }, [preferences, isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await updateUserPreferences(localPrefs);
            setMessage(t('auth.saveSuccess'));
            setTimeout(() => setMessage(''), 2000);
        } catch (error) {
            setMessage(t('auth.saveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        onClose();
    };

    const handleRefineTaste = () => {
        onClose();
        window.location.hash = 'onboarding';
    };

    const ratingOptions: UserPreferences['ageRating'][] = ['Any', 'G', 'PG', 'PG-13', 'R', 'NC-17'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('auth.profileTitle')}>
            <div className="flex flex-col gap-6">
                {user && <p className="text-center text-text-secondary -mt-4 mb-2">{t('auth.loggedInAs', { email: user.email ?? '' })}</p>}

                {/* Taste Section */}
                <div className="flex flex-col gap-2 p-4 bg-primary/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-text-primary">{t('auth.taste.title')}</h3>
                    <p className="text-sm text-text-secondary">
                        {t('auth.taste.classified', { count: tastePreferences.length.toString(), total: totalMoviesInGame.toString() })}
                    </p>
                    <button
                        onClick={handleRefineTaste}
                        className="bg-surface hover:brightness-125 text-accent font-semibold py-2 px-4 rounded-md mt-2 text-sm transition-all"
                    >
                        {t('auth.taste.button')}
                    </button>
                </div>

                {/* Preferences Section */}
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-text-primary">{t('auth.preferencesTitle')}</h3>
                    <div className="flex flex-col">
                        <label htmlFor="startYear" className="text-sm font-medium text-text-secondary mb-1">{t('auth.startYear')}</label>
                        <input
                            id="startYear"
                            type="number"
                            min="1920"
                            max={new Date().getFullYear()}
                            value={localPrefs.startYear?.toString() || ''}
                            onChange={(e) => setLocalPrefs(p => ({ ...p, startYear: parseInt(e.target.value, 10) }))}
                            className="bg-primary border border-primary/50 text-text-primary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="ageRating" className="text-sm font-medium text-text-secondary mb-1">{t('auth.ageRating')}</label>
                        <select
                            id="ageRating"
                            value={localPrefs.ageRating || 'Any'}
                            onChange={(e) => setLocalPrefs(p => ({ ...p, ageRating: e.target.value as UserPreferences['ageRating'] }))}
                            className="bg-primary border border-primary/50 text-text-primary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {ratingOptions.map(r => <option key={r} value={r}>{r === 'Any' ? t('auth.ratings.any') : r}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <button type="submit" disabled={loading} className="flex-grow bg-accent text-background font-bold py-2 px-4 rounded-md mt-2 hover:opacity-90 transition-opacity disabled:bg-gray-500">
                            {loading ? <div className="h-5 w-5 mx-auto border-2 border-background border-t-transparent rounded-full animate-spin"></div> : t('auth.save')}
                        </button>
                        {message && <p className="text-sm text-accent animate-fade-in">{message}</p>}
                    </div>
                </form>
                <button
                    onClick={handleLogout}
                    className="w-full bg-surface hover:brightness-125 text-text-primary font-bold py-2 px-4 rounded-md border border-primary/50 transition-all duration-300"
                >
                    {t('auth.logout')}
                </button>
            </div>
        </Modal>
    );
};

export default ProfileModal;
