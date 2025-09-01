import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message, Space, Typography, Tag, Popconfirm, Grid } from 'antd';
type AntdBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
import { DeleteOutlined, ReloadOutlined, ClockCircleOutlined, MailOutlined, LinkOutlined } from '@ant-design/icons';
import { groupsApiService } from '../../hooks/useGroupsApi';
import { GroupPendingInvitationModel } from '../../shared/Models';
import { InviteManager } from '../../utils/inviteManager';
import { useTranslation } from 'react-i18next';
import styles from './InvitationManager.module.css';
import type { ColumnsType } from 'antd/es/table';
import logger from '../../utils/logger';

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
    const { t } = useTranslation();
    const [invitations, setInvitations] = useState<GroupPendingInvitationModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Breakpoints: Mobile-Ansicht bei xs
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.sm;

    // Einladungen laden
    const loadInvitations = async () => {
        try {
            setRefreshing(true);
            const response = await groupsApiService.getGroupInvitations(parseInt(groupId));
            setInvitations(response.invitations);
        } catch (error) {
            logger.error('Fehler beim Laden der Einladungen:', error);
            message.error(t('inviteManager.messages.loadError'));
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
                    ? t('inviteManager.messages.revokeSuccessEmail', { email })
                    : t('inviteManager.messages.revokeSuccess')
            );

            // Liste neu laden
            await loadInvitations();
        } catch (error) {
            logger.error('Fehler beim Widerrufen der Einladung:', error);
            message.error(t('inviteManager.messages.revokeError'));
        } finally {
            setLoading(false);
        }
    };

    // Link kopieren
    const copyInviteLink = async (token: string) => {
        try {
            const url = InviteManager.createInviteUrl(token);
            await navigator.clipboard.writeText(url);
            message.success(t('inviteManager.messages.copySuccess'));
        } catch (error) {
            logger.error('Fehler beim Kopieren:', error);
            message.error(t('inviteManager.messages.copyError'));
        }
    };

    // Status-Tag rendern
    const renderStatusTag = (status: string, expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const isExpired = expires < now;

        if (isExpired) {
            return <Tag color="default">{t('inviteManager.statuses.expired')}</Tag>;
        }

        switch (status) {
            case 'pending':
                return <Tag color="orange">{t('inviteManager.statuses.pending')}</Tag>;
            case 'used':
                return <Tag color="green">{t('inviteManager.statuses.used')}</Tag>;
            case 'expired':
                return <Tag color="default">{t('inviteManager.statuses.expired')}</Tag>;
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
            return t('inviteManager.statuses.expired');
        }

        if (diffHours > 0) {
            return t('inviteManager.statuses.remaining', { hours: diffHours, minutes: diffMinutes });
        } else if (diffMinutes > 0) {
            return t('inviteManager.statuses.remainingMinutes', { minutes: diffMinutes });
        } else {
            return t('inviteManager.statuses.expiresSoon');
        }
    };

    // Desktop: Tabellen-Spalten definieren
    const desktopColumns: ColumnsType<GroupPendingInvitationModel> = [
        {
            title: t('inviteManager.table.columns.email'),
            dataIndex: 'invitedEmail',
            key: 'invitedEmail',
            render: (email: string) => (
                email ? (
                    <Space>
                        <MailOutlined />
                        <Text className={styles.wrapText}>{email}</Text>
                    </Space>
                ) : (
                    <Text type="secondary" className={styles.wrapText}>
                        <LinkOutlined />
                        {t('inviteManager.table.linkInvitation')}
                    </Text>
                )
            ),
            responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as AntdBreakpoint[],
        },
        {
            title: t('inviteManager.table.columns.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: GroupPendingInvitationModel) =>
                renderStatusTag(status, record.expiresAt),
            width: 120,
            responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as AntdBreakpoint[],
        },
        {
            title: t('inviteManager.table.columns.invitedBy'),
            dataIndex: 'inviterName',
            key: 'inviterName',
            render: (name: string) => <Text className={styles.wrapText}>{name}</Text>,
            responsive: ['sm', 'md', 'lg', 'xl', 'xxl'] as AntdBreakpoint[],
        },
        {
            title: t('inviteManager.table.columns.createdAt'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => <Text className={styles.wrapText}>{new Date(date).toLocaleString()}</Text>,
            responsive: ['md', 'lg', 'xl', 'xxl'] as AntdBreakpoint[],
        },
        {
            title: t('inviteManager.table.columns.expiresAt'),
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            render: (date: string) => (
                <Space>
                    <ClockCircleOutlined />
                    <Text type="secondary" className={styles.wrapText}>{formatExpiresAt(date)}</Text>
                </Space>
            ),
            responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as AntdBreakpoint[],
        },
        {
            title: t('inviteManager.table.columns.actions'),
            key: 'actions',
            render: (_: unknown, record: GroupPendingInvitationModel) => {
                const isExpired = new Date(record.expiresAt) < new Date();
                return (
                    <Space style={{ flexWrap: 'wrap' }}>
                        {record.status === 'pending' && (
                            <Button
                                type="text"
                                icon={<LinkOutlined />}
                                size="small"
                                onClick={() => copyInviteLink(record.token)}
                            />
                        )}
                        {!isExpired && (
                            <Popconfirm
                                title={t('inviteManager.confirm.revokeTitle')}
                                onConfirm={() => revokeInvitation(record.token, record.invitedEmail)}
                                okText={t('inviteManager.confirm.ok')}
                                cancelText={t('inviteManager.confirm.cancel')}
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    danger
                                    loading={loading}
                                />
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
            width: 140,
            responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as AntdBreakpoint[],
        }
    ];

    // Mobile: Einzelspalte mit gestapelten Zeileninhalten
    const renderMobileItem = (_: unknown, record: GroupPendingInvitationModel) => (

        <div className={styles.mobileItem}>
            <div className={styles.mobileMain}>
                <div className={styles.mobileLine}>
                    {record.invitedEmail ? <MailOutlined /> : <LinkOutlined />}
                    <Text className={styles.wrapText}>
                        {record.invitedEmail || t('inviteManager.table.linkInvitation')}
                    </Text>
                </div>
                <div className={styles.mobileLine}>
                    <ClockCircleOutlined />
                    <Text type="secondary" className={styles.wrapText}>{formatExpiresAt(record.expiresAt)}</Text>
                </div>
                <div className={styles.mobileLine}>{renderStatusTag(record.status, record.expiresAt)}</div>
                {record.inviterName && (
                    <div className={styles.mobileLine}>
                        <Text type="secondary" className={styles.wrapText}>{record.inviterName}</Text>
                    </div>
                )}
            </div>
            <div className={styles.mobileActions}>
                {record.status === 'pending' && (
                    <>
                        <Button
                            type="text"
                            icon={<LinkOutlined />}
                            size="small"
                            onClick={() => copyInviteLink(record.token)} />
                        <Popconfirm
                            title={t('inviteManager.confirm.revokeTitle')}
                            onConfirm={() => revokeInvitation(record.token, record.invitedEmail)}
                            okText={t('inviteManager.confirm.ok')}
                            cancelText={t('inviteManager.confirm.cancel')}
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" icon={<DeleteOutlined />} size="small" danger loading={loading} />
                        </Popconfirm>
                    </>
                )}
            </div>
        </div>
    );

    const mobileColumns: ColumnsType<GroupPendingInvitationModel> = [
        { title: '', key: 'mobile', render: renderMobileItem },
    ];

    const columns: ColumnsType<GroupPendingInvitationModel> = isMobile ? mobileColumns : desktopColumns;

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
                    {t('inviteManager.titleWithName', { name: groupName })}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            wrapClassName={styles.modalWrap}
            footer={[
                <Button key="refresh" icon={<ReloadOutlined />} onClick={loadInvitations} loading={refreshing}>
                    {t('inviteManager.refresh')}
                </Button>,
                <Button key="close" onClick={onClose}>
                    {t('inviteManager.close')}
                </Button>
            ]}
            width={'100%'}
            style={{ maxWidth: 1000 }}
            bodyStyle={{ maxHeight: '75vh', overflow: 'auto' }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Text type="secondary">
                        {t('inviteManager.intro')}
                    </Text>
                </div>

                <Table
                    className={isMobile ? `${styles.responsiveTable} ${styles.mobileList}` : styles.responsiveTable}
                    columns={columns}
                    dataSource={invitations || []}
                    rowKey="id"
                    loading={refreshing}
                    pagination={false}
                    size="small"
                    showHeader={!isMobile}
                    scroll={isMobile ? undefined : { x: true }}
                    locale={{
                        emptyText: refreshing ? t('inviteManager.empty.loading') : t('inviteManager.empty.none')
                    }}
                />

                {invitations && invitations.length > 0 && (
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {t('inviteManager.tips')}
                        </Text>
                    </div>
                )}
            </Space>
        </Modal>
    );
};

export default InvitationManager;
