import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import Modal from '../../../components/Modal';
import { useI18n } from '../../../src/i18n/i18n';
import { useAuth } from '../AuthContext';
import { GoogleIcon } from '../../../components/icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const { signInWithGoogle } = useAuth();
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAuthError = (err: any) => {
        switch (err.code) {
            case 'auth/email-already-in-use':
                setError(t('auth.error.emailInUse'));
                break;
            case 'auth/weak-password':
                setError(t('auth.error.weakPassword'));
                break;
            case 'auth/invalid-credential':
                setError(t('auth.error.invalidCredential'));
                break;
            case 'auth/popup-closed-by-user':
                // This is not really an error, so we can just ignore it.
                setError(null);
                break;
            default:
                setError(t('auth.error.generic'));
                console.error(err);
        }
    }

    const handleGoogleSignIn = async () => {
        setError(null);
        setLoading(true);
        try {
            await signInWithGoogle();
            onClose();
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!auth) {
            setError("Firebase is not configured.");
            setLoading(false);
            return;
        }

        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError(null);
        setEmail('');
        setPassword('');
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isLoginView ? t('auth.login') : t('auth.signup')}>
            <div className="flex flex-col gap-4">
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full bg-white text-gray-700 font-semibold py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <GoogleIcon className="w-5 h-5" />
                    {t('auth.signInWithGoogle')}
                </button>
                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-primary"></div>
                    <span className="flex-shrink mx-4 text-text-secondary text-xs uppercase">{t('auth.orSeparator')}</span>
                    <div className="flex-grow border-t border-primary"></div>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-sm font-medium text-text-secondary mb-1">{t('auth.email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-primary border border-primary/50 text-text-primary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password" className="text-sm font-medium text-text-secondary mb-1">{t('auth.password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-primary border border-primary/50 text-text-primary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-accent text-background font-bold py-2 px-4 rounded-md mt-2 hover:opacity-90 transition-opacity disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {loading ? <div className="h-5 w-5 mx-auto border-2 border-background border-t-transparent rounded-full animate-spin"></div> : (isLoginView ? t('auth.login') : t('auth.createAccount'))}
                    </button>
                    <p className="text-center text-sm">
                        <button type="button" onClick={toggleView} className="text-accent hover:underline">
                            {isLoginView ? t('auth.noAccount') : t('auth.hasAccount')}
                        </button>
                    </p>
                </form>
            </div>
        </Modal>
    );
};

export default AuthModal;