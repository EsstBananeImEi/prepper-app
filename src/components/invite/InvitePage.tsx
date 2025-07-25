import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Alert, Spin, Space, Divider } from 'antd';
import { UserOutlined, TeamOutlined, ClockCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import { InviteManager, type InviteToken } from '../../utils/inviteManager';
import { useStore } from '../../store/Store';

const { Title, Text, Paragraph } = Typography;

const InvitePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { store } = useStore();
    const [invite, setInvite] = useState<InviteToken | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (token) {
            validateInvite(token);
        } else {
            setError('Kein Invite-Token gefunden');
            setLoading(false);
        }
    }, [token]);

    // Automatische Weiterleitung für nicht angemeldete Benutzer
    useEffect(() => {
        // Warte bis Loading abgeschlossen ist und Invite validiert wurde
        if (loading) return;

        // Wenn Fehler aufgetreten ist, keine Weiterleitung
        if (error || !invite) return;

        // Prüfe ob User nicht angemeldet ist
        const isLoggedIn = store.user && store.user.id;

        // 🚫 KEINE automatische Weiterleitung mehr!
        // Das verursacht Probleme auf dem Server und Endlosschleifen
        // Stattdessen zeigen wir die Invite-Page mit Login/Register-Buttons

        if (!isLoggedIn && token) {
            // Speichere Invite für nach dem Login (ohne Weiterleitung)
            InviteManager.storePendingInvite(
                token,
                invite.groupId,
                invite.groupName,
                invite.inviterName,
                invite.expiresAt
            );

            console.log('📝 Invite gespeichert, zeige Login-Buttons an');
            // KEINE navigate() mehr - die UI zeigt Login/Register-Buttons
        }
    }, [loading, invite, error, store.user, token, navigate]);

    const validateInvite = async (inviteToken: string) => {
        try {
            setLoading(true);
            const validatedInvite = await InviteManager.validateInviteToken(inviteToken);

            if (!validatedInvite) {
                setError('Dieser Einladungslink ist ungültig oder abgelaufen');
                return;
            }

            setInvite(validatedInvite);
        } catch (error) {
            console.error('Fehler beim Validieren der Einladung:', error);
            setError('Fehler beim Validieren der Einladung');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!invite || !token) return;

        // Prüfe ob User eingeloggt ist
        if (!store.user || !store.user.id) {
            // Speichere Invite für nach dem Login
            InviteManager.storePendingInvite(
                token,
                invite.groupId,
                invite.groupName,
                invite.inviterName,
                invite.expiresAt
            );

            // Leite zum Login weiter
            navigate(`/login?redirect=/invite/${token}`);
            return;
        }

        try {
            setJoining(true);

            // Token für Backend-Authentifizierung bereitstellen
            if (store.user?.access_token) {
                localStorage.setItem('access_token', store.user.access_token);
            }

            const success = await InviteManager.joinGroupViaInvite(token, store.user.id?.toString() || '');

            if (success) {
                // Erfolgreicher Beitritt - Navigate zur Gruppenverwaltung
                navigate('/user', {
                    state: {
                        message: `Du bist erfolgreich der Gruppe "${invite.groupName}" beigetreten!`,
                        tab: 'groups' // Falls es Tabs gibt
                    }
                });
            }
        } catch (error) {
            console.error('Fehler beim Gruppenbeitritt:', error);
            setError('Fehler beim Beitritt zur Gruppe. Bitte versuche es erneut.');
        } finally {
            setJoining(false);
        }
    };

    const handleRegister = () => {
        if (!invite || !token) return;

        // Speichere Invite als persistent für nach der Registrierung UND Account-Aktivierung
        InviteManager.storePendingInvite(
            token,
            invite.groupId,
            invite.groupName,
            invite.inviterName,
            invite.expiresAt,
            {
                persistent: true, // Wichtig: Bleibt auch nach Registrierung bestehen!
                email: undefined // Wird später bei der Registrierung gesetzt
            }
        );

        // Leite zur Registrierung weiter
        navigate(`/register?redirect=/invite/${token}`);
    };

    const formatExpiryDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffHours = Math.ceil((timestamp - now.getTime()) / (1000 * 60 * 60));

        if (diffHours < 24) {
            return `${diffHours} Stunden`;
        } else {
            const diffDays = Math.ceil(diffHours / 24);
            return `${diffDays} Tagen`;
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !invite) {
        return (
            <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
                <Card>
                    <div style={{ textAlign: 'center' }}>
                        <Alert
                            message="Einladung ungültig"
                            description={error || 'Diese Einladung konnte nicht gefunden werden.'}
                            type="error"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                        <Button type="primary" onClick={() => navigate('/')}>
                            Zur Startseite
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const isLoggedIn = store.user && store.user.id;

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
            <Card>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <TeamOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={2}>Gruppen-Einladung</Title>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <Card size="small" style={{ backgroundColor: '#f6f8fa' }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div>
                                <Text strong>Gruppe:</Text>
                                <Text style={{ marginLeft: 8, fontSize: 16 }}>{invite.groupName}</Text>
                            </div>
                            <div>
                                <UserOutlined style={{ marginRight: 8 }} />
                                <Text>Eingeladen von: {invite.inviterName}</Text>
                            </div>
                            <div>
                                <ClockCircleOutlined style={{ marginRight: 8 }} />
                                <Text>Gültig noch: {formatExpiryDate(invite.expiresAt)}</Text>
                            </div>
                        </Space>
                    </Card>
                </div>

                <Paragraph>
                    Du wurdest von <Text strong>{invite.inviterName}</Text> eingeladen,
                    der Gruppe <Text strong>&quot;{invite.groupName}&quot;</Text> beizutreten.
                </Paragraph>

                {isLoggedIn ? (
                    <div>
                        <Alert
                            message={`Angemeldet als: ${store.user?.username || store.user?.email}`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Button
                            type="primary"
                            size="large"
                            icon={<TeamOutlined />}
                            loading={joining}
                            onClick={handleJoinGroup}
                            block
                        >
                            {joining ? 'Trete bei...' : 'Gruppe beitreten'}
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Alert
                            message="Anmeldung erforderlich"
                            description="Um der Gruppe beizutreten, musst du dich erst anmelden oder registrieren."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<UserOutlined />}
                                onClick={() => navigate(`/login?redirect=/invite/${token}`)}
                                block
                            >
                                Anmelden
                            </Button>

                            <Divider>oder</Divider>

                            <Button
                                size="large"
                                icon={<UserAddOutlined />}
                                onClick={handleRegister}
                                block
                            >
                                Neues Konto erstellen
                            </Button>
                        </Space>

                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Nach erfolgreicher Anmeldung wirst du automatisch der Gruppe hinzugefügt.
                            </Text>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Button type="link" onClick={() => navigate('/')}>
                        Zur Startseite
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default InvitePage;
