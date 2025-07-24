import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
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
        // Nur ausführen wenn User eingeloggt ist
        if (!store.user || !store.user.id) {
            return;
        }

        const processInvites = async () => {
            try {
                const pendingInvites = InviteManager.getPendingInvites();

                if (pendingInvites.length === 0) {
                    return;
                }

                console.log(`Verarbeite ${pendingInvites.length} ausstehende Invites...`);

                // Zeige Benachrichtigung über ausstehende Invites
                if (pendingInvites.length === 1) {
                    message.loading({
                        content: `Trete Gruppe "${pendingInvites[0].groupName}" bei...`,
                        key: 'invite-processing',
                        duration: 0
                    });
                } else {
                    message.loading({
                        content: `Trete ${pendingInvites.length} Gruppen bei...`,
                        key: 'invite-processing',
                        duration: 0
                    });
                }

                // Verarbeite alle ausstehenden Invites
                await InviteManager.processPendingInvites(store.user?.id?.toString() || '');

                // Erfolgsmeldung
                message.destroy('invite-processing');

                if (pendingInvites.length === 1) {
                    message.success({
                        content: `✅ Erfolgreich der Gruppe "${pendingInvites[0].groupName}" beigetreten!`,
                        duration: 5
                    });
                } else {
                    message.success({
                        content: `✅ Erfolgreich ${pendingInvites.length} Gruppen beigetreten!`,
                        duration: 5
                    });
                }

                // Prüfe ob wir von einem Invite-Link kommen
                const searchParams = new URLSearchParams(location.search);
                const redirectUrl = searchParams.get('redirect');

                if (redirectUrl && redirectUrl.includes('/invite/')) {
                    // Navigiere zur Gruppen-Seite statt zurück zum Invite
                    setTimeout(() => {
                        navigate('/groups', {
                            state: {
                                fromInvite: true,
                                groupName: pendingInvites[0]?.groupName
                            }
                        });
                    }, 1500);
                } else {
                    // Navigiere zur Gruppen-Seite
                    setTimeout(() => {
                        navigate('/groups');
                    }, 1500);
                }

            } catch (error) {
                console.error('Fehler beim Verarbeiten der ausstehenden Invites:', error);
                message.destroy('invite-processing');
                message.error('Fehler beim Beitritt zu einer Gruppe. Bitte versuche es erneut.');
            }
        };

        // Kleine Verzögerung, um sicherzustellen, dass der Login-Prozess abgeschlossen ist
        const timer = setTimeout(processInvites, 1000);

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
