import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import i18n from '../i18n';
import { InviteManager } from '../utils/inviteManager';
import { useStore } from '../store/Store';

/**
 * Hook für automatische Verarbeitung von ausstehenden Invites nach Login
 */
export const useInviteProcessor = () => {
    const { store } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Nur ausführen wenn User vollständig eingeloggt ist
        if (!store.user || !store.user.id) {
            console.log('Invite-Verarbeitung übersprungen - kein User oder User-ID');
            return;
        }

        // Zusätzlich prüfen ob Access-Token vorhanden ist (echte Anmeldung)
        if (!store.user.access_token) {
            console.log('Invite-Verarbeitung übersprungen - kein Access-Token');
            return;
        }

        // WICHTIG: Nicht während Registrierung oder auf Registrierungsseiten ausführen
        const currentPath = location.pathname;
        if (currentPath.includes('/register') || currentPath.includes('/activation') || currentPath.includes('/verify')) {
            console.log('Invite-Verarbeitung übersprungen - auf Registrierungsseite:', currentPath);
            return;
        }

        const processInvites = async () => {
            try {
                console.log('🔍 Invite-Verarbeitung gestartet für User:', store.user?.email);

                // ✅ NEUE DEBUG-AUSGABEN:
                console.log('🔑 Debug - User im Store:', store.user);
                console.log('🔑 Debug - Access Token vorhanden:', !!store.user?.access_token);
                console.log('🔑 Debug - Access Token (erste 20 Zeichen):', store.user?.access_token?.substring(0, 20) + '...');

                const localUser = JSON.parse(localStorage.getItem('user') || 'null');
                console.log('🔑 Debug - LocalStorage User:', localUser);
                console.log('🔑 Debug - LocalStorage Token vorhanden:', !!localUser?.access_token);

                // Zusätzliche Prüfung: Ist der User wirklich bereit für Invite-Verarbeitung?
                const isFromRegistration = sessionStorage.getItem('just_registered') === 'true';
                if (isFromRegistration) {
                    console.log('❌ Invite-Verarbeitung übersprungen - gerade registriert');
                    return;
                }

                const pendingInvites = InviteManager.getPendingInvites();

                if (pendingInvites.length === 0) {
                    console.log('ℹ️ Keine ausstehenden Invites vorhanden');
                    return;
                }

                console.log(`🚀 Verarbeite ${pendingInvites.length} ausstehende Invites...`);

                // Zeige Benachrichtigung über ausstehende Invites
                if (pendingInvites.length === 1) {
                    message.loading({
                        content: i18n.t('invites.processingOne', { name: pendingInvites[0].groupName }),
                        key: 'invite-processing',
                        duration: 0
                    });
                } else {
                    message.loading({
                        content: i18n.t('invites.processingMany', { count: pendingInvites.length }),
                        key: 'invite-processing',
                        duration: 0
                    });
                }

                // Verarbeite alle ausstehenden Invites mit User-Email und Timeout
                const processingPromise = InviteManager.processPendingInvites(
                    store.user?.id?.toString() || '',
                    store.user?.email
                );

                // 15 Sekunden Timeout für die gesamte Invite-Verarbeitung
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Invite-Verarbeitung Timeout')), 15000);
                });

                await Promise.race([processingPromise, timeoutPromise]);

                // Erfolgsmeldung
                message.destroy('invite-processing');

                // Session-Flag löschen nach erfolgreicher Verarbeitung
                sessionStorage.removeItem('just_registered');

                if (pendingInvites.length === 1) {
                    message.success({
                        content: i18n.t('invites.successOne', { name: pendingInvites[0].groupName }),
                        duration: 5
                    });
                } else {
                    message.success({
                        content: i18n.t('invites.successMany', { count: pendingInvites.length }),
                        duration: 5
                    });
                }

                // Prüfe ob wir von einem Invite-Link kommen
                const searchParams = new URLSearchParams(location.search);
                const redirectUrl = searchParams.get('redirect');

                if (redirectUrl && redirectUrl.includes('/invite/')) {
                    // Navigiere zur User-Seite statt zurück zum Invite
                    setTimeout(() => {
                        navigate('/user', {
                            state: {
                                fromInvite: true,
                                groupName: pendingInvites[0]?.groupName
                            }
                        });
                    }, 1500);
                } else {
                    // Navigiere zur User-Seite
                    setTimeout(() => {
                        navigate('/user');
                    }, 1500);
                }

            } catch (error: unknown) {
                console.error('❌ Fehler beim Verarbeiten der ausstehenden Invites:', error);
                message.destroy('invite-processing');

                const errorMessage = error instanceof Error ? error.message : String(error);
                if (errorMessage.includes('Timeout')) {
                    message.error(i18n.t('invites.timeout'));
                } else {
                    message.error(i18n.t('invites.error'));
                }

                // Bei Timeout oder schwerwiegenden Fehlern: Session-Flag trotzdem löschen
                sessionStorage.removeItem('just_registered');
            }
        };

        // Verzögerung erhöhen, um sicherzustellen, dass es ein echter Login ist
        // und nicht Teil eines Registrierungsprozesses
        const timer = setTimeout(processInvites, 2500);

        return () => clearTimeout(timer);
    }, [store.user, navigate, location]);
};

/**
 * Hook für Login-Redirect von Invite-Links
 */
export const useInviteRedirect = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const getRedirectUrl = (): string | null => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('redirect');
    };

    const handleLoginSuccess = () => {
        const redirectUrl = getRedirectUrl();

        if (redirectUrl) {
            // Wenn es ein Invite-Redirect ist, navigiere direkt dorthin
            if (redirectUrl.includes('/invite/')) {
                navigate(redirectUrl);
                return;
            }

            // Andere Redirects
            navigate(redirectUrl);
        } else {
            // Standard-Redirect nach Login
            navigate('/');
        }
    };

    const isFromInvite = (): boolean => {
        const redirectUrl = getRedirectUrl();
        return redirectUrl?.includes('/invite/') || false;
    };

    return {
        getRedirectUrl,
        handleLoginSuccess,
        isFromInvite
    };
};
