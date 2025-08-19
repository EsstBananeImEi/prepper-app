import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, message, Space, Typography, Tag, Tooltip, Popconfirm } from 'antd';
import { DeleteOutlined, ReloadOutlined, ClockCircleOutlined, MailOutlined, LinkOutlined } from '@ant-design/icons';
import { groupsApiService } from '../../hooks/useGroupsApi';
import { GroupPendingInvitationModel } from '../../shared/Models';
import { InviteManager } from '../../utils/inviteManager';

const { Text } = Typography;

interface InvitationManagerProps {
    groupId: string;
    groupName: string;
    visible: boolean;
    onClose: () => void;
}

const InvitationManager: React.FC<InvitationManagerProps> = ({
    groupId,
    groupName,
    visible,
    onClose
}) => {
    const [invitations, setInvitations] = useState<GroupPendingInvitationModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Einladungen laden
    const loadInvitations = async () => {
        try {
            setRefreshing(true);
            const response = await groupsApiService.getGroupInvitations(parseInt(groupId));
            setInvitations(response.invitations);
        } catch (error) {
            console.error('Fehler beim Laden der Einladungen:', error);
            message.error('Fehler beim Laden der Einladungen');
        } finally {
            setRefreshing(false);
        }
    };

    // Einladung widerrufen
    const revokeInvitation = async (token: string, email?: string) => {
        try {
            setLoading(true);
            await groupsApiService.revokeInvitation(parseInt(groupId), token);

            message.success(
                email
                    ? `Einladung für ${email} wurde widerrufen`
                    : 'Einladung wurde widerrufen'
            );

            // Liste neu laden
            await loadInvitations();
        } catch (error) {
            console.error('Fehler beim Widerrufen der Einladung:', error);
            message.error('Fehler beim Widerrufen der Einladung');
        } finally {
            setLoading(false);
        }
    };

    // Link kopieren
    const copyInviteLink = async (token: string) => {
        try {
            const url = InviteManager.createInviteUrl(token);
            await navigator.clipboard.writeText(url);
            message.success('Einladungslink kopiert!');
        } catch (error) {
            console.error('Fehler beim Kopieren:', error);
            message.error('Fehler beim Kopieren des Links');
        }
    };

    // Status-Tag rendern
    const renderStatusTag = (status: string, expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const isExpired = expires < now;

        if (isExpired) {
            return <Tag color="default">Abgelaufen</Tag>;
        }

        switch (status) {
            case 'pending':
                return <Tag color="orange">Ausstehend</Tag>;
            case 'used':
                return <Tag color="green">Verwendet</Tag>;
            case 'expired':
                return <Tag color="default">Abgelaufen</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    // Ablaufzeit formatieren
    const formatExpiresAt = (expiresAt: string) => {
        const expires = new Date(expiresAt);
        const now = new Date();
        const diffMs = expires.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffMs < 0) {
            return 'Abgelaufen';
        }

        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m verbleibend`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m verbleibend`;
        } else {
            return 'Läuft bald ab';
        }
    };

    // Tabellen-Spalten definieren
    const columns = [
        {
            title: 'E-Mail',
            dataIndex: 'invitedEmail',
            key: 'invitedEmail',
            render: (email: string) => (
                email ? (
                    <Space>
                        <MailOutlined />
                        <Text>{email}</Text>
                    </Space>
                ) : (
                    <Text type="secondary">
                        <LinkOutlined />
                        Link-Einladung
                    </Text>
                )
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: GroupPendingInvitationModel) =>
                renderStatusTag(status, record.expiresAt)
        },
        {
            title: 'Erstellt von',
            dataIndex: 'inviterName',
            key: 'inviterName',
            render: (name: string) => <Text>{name}</Text>
        },
        {
            title: 'Erstellt am',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleString('de-DE')
        },
        {
            title: 'Läuft ab',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            render: (date: string) => (
                <Tooltip title={new Date(date).toLocaleString('de-DE')}>
                    <Space>
                        <ClockCircleOutlined />
                        <Text type="secondary">{formatExpiresAt(date)}</Text>
                    </Space>
                </Tooltip>
            )
        },
        {
            title: 'Aktionen',
            key: 'actions',
            render: (_: unknown, record: GroupPendingInvitationModel) => (
                <Space>
                    {record.status === 'pending' && (
                        <Tooltip title="Link kopieren">
                            <Button
                                type="text"
                                icon={<LinkOutlined />}
                                size="small"
                                onClick={() => copyInviteLink(record.token)}
                            />
                        </Tooltip>
                    )}
                    <Popconfirm
                        title="Einladung widerrufen"
                        onConfirm={() => revokeInvitation(record.token, record.invitedEmail)}
                        okText="Widerrufen"
                        cancelText="Abbrechen"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Einladung widerrufen">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                loading={loading}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Beim Öffnen des Modals Daten laden
    useEffect(() => {
        if (visible) {
            loadInvitations();
        }
    }, [visible]);

    return (
        <Modal
            title={
                <Space>
                    <MailOutlined />
                    Einladungen verwalten - &quot;{groupName}&quot;
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="refresh" icon={<ReloadOutlined />} onClick={loadInvitations} loading={refreshing}>
                    Aktualisieren
                </Button>,
                <Button key="close" onClick={onClose}>
                    Schließen
                </Button>
            ]}
            width={1000}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Text type="secondary">
                        Hier siehst du alle ausstehenden Einladungen für diese Gruppe.
                        Du kannst Einladungen widerrufen, um die Tokens ungültig zu machen.
                    </Text>
                </div>

                <Table
                    columns={columns}
                    dataSource={invitations || []}
                    rowKey="id"
                    loading={refreshing}
                    pagination={false}
                    size="small"
                    locale={{
                        emptyText: refreshing ? 'Lade Einladungen...' : 'Keine ausstehenden Einladungen'
                    }}
                />

                {invitations && invitations.length > 0 && (
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            💡 Tipp: Widerrufene Einladungen können nicht mehr verwendet werden.
                            Abgelaufene Einladungen werden automatisch ungültig.
                        </Text>
                    </div>
                )}
            </Space>
        </Modal>
    );
};

export default InvitationManager;
