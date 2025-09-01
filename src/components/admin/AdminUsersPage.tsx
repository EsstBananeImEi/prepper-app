import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Table, Space, Button, Popconfirm, Switch, Input, message, Typography, Tag, Drawer, Descriptions, Divider, Pagination } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, LockOutlined, UnlockOutlined, MailOutlined, UserSwitchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { adminApi } from '../../utils/secureApiClient';
import { useAdminValidation } from '../../hooks/useAdminValidation';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/Store';
import { useNavigate, useParams } from 'react-router-dom';
import listStyles from '../storage-components/storage-list/StorageList.module.css';
import logger from '../../utils/logger';

interface ManagedUser {
    id: number;
    username: string;
    email: string;
    isAdmin?: boolean;
    isManager?: boolean;
    locked?: boolean;
    persons?: number;
}

export default function AdminUsersPage() {
    const { t } = useTranslation();
    const { isAdmin, isValidating } = useAdminValidation();
    const { store } = useStore();
    const isManager = !!store.user?.isManager;
    const isOnlyManager = isManager && !store.user?.isAdmin;
    const navigate = useNavigate();
    const params = useParams();
    const selectedIdFromRoute = params.id ? Number(params.id) : null;
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [emailEdits, setEmailEdits] = useState<Record<number, string>>({});
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [isPortrait, setIsPortrait] = useState<boolean>(typeof window !== 'undefined' ? window.innerHeight >= window.innerWidth : false);
    const [drawerWidth, setDrawerWidth] = useState<number | undefined>(
        typeof window !== 'undefined' && window.innerHeight < window.innerWidth
            ? Math.max(320, Math.min(Math.round(window.innerWidth * 0.6), 560))
            : undefined
    );
    const [drawerHeight, setDrawerHeight] = useState<number | undefined>(typeof window !== 'undefined' && window.innerHeight >= window.innerWidth ? Math.min(Math.round(window.innerHeight * 0.9), 720) : undefined);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;
    const containerRef = useRef<HTMLDivElement | null>(null);

    const pagedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return users.slice(start, end);
    }, [users, currentPage]);

    const load = async () => {
        setLoading(true);
        try {
            const list = await adminApi.listUsers();
            setUsers(list);
        } catch (e) {
            logger.error(e);
            message.error(t('adminUsers.messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Clamp current page when users length changes
    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(users.length / pageSize));
        if (currentPage > maxPage) setCurrentPage(maxPage);
    }, [users.length]);

    // Orientation listener for responsive Drawer
    useEffect(() => {
        const onResize = () => {
            const portrait = window.innerHeight >= window.innerWidth;
            setIsPortrait(portrait);
            if (portrait) {
                setDrawerHeight(Math.min(Math.round(window.innerHeight * 0.9), 720));
                setDrawerWidth(undefined);
            } else {
                setDrawerWidth(Math.max(320, Math.min(Math.round(window.innerWidth * 0.6), 560)));
                setDrawerHeight(undefined);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Deep-link: open panel when /admin/users/:id or /admin/users/:id/edit
    useEffect(() => {
        if (!users.length) return;
        if (selectedIdFromRoute) {
            const u = users.find(x => x.id === selectedIdFromRoute) || null;
            if (u) {
                setSelectedUser(u);
                // Do not prefill admin email for managers
                setEmailEdits(prev => ({ ...prev, [u.id]: (isOnlyManager && u.isAdmin) ? '' : u.email }));
                setPanelOpen(true);
            }
        }
    }, [users, selectedIdFromRoute]);

    const onToggleAdmin = async (u: ManagedUser, next: boolean) => {
        if (!isAdmin) {
            message.error(t('adminUsers.messages.adminOnlyChangeAdmin'));
            return;
        }
        try {
            await adminApi.setAdmin(u.id, next);
            message.success(next ? t('adminUsers.messages.adminGranted') : t('adminUsers.messages.adminRevoked'));
            setSelectedUser(prev => (prev && prev.id === u.id ? { ...prev, isAdmin: next } : prev));
            load();
        } catch {
            message.error(t('adminUsers.messages.actionFailed'));
        }
    };

    const onToggleManager = async (u: ManagedUser, next: boolean) => {
        try {
            await adminApi.setManager(u.id, next);
            message.success(next ? t('adminUsers.messages.managerSet') : t('adminUsers.messages.managerRemoved'));
            setSelectedUser(prev => (prev && prev.id === u.id ? { ...prev, isManager: next } : prev));
            load();
        } catch {
            message.error(t('adminUsers.messages.actionFailed'));
        }
    };

    const onToggleLocked = async (u: ManagedUser, next: boolean) => {
        try {
            await adminApi.setLocked(u.id, next);
            message.success(next ? t('adminUsers.messages.userLocked') : t('adminUsers.messages.userUnlocked'));
            setSelectedUser(prev => (prev && prev.id === u.id ? { ...prev, locked: next } : prev));
            load();
        } catch {
            message.error(t('adminUsers.messages.actionFailed'));
        }
    };

    const onUpdateEmail = async (u: ManagedUser) => {
        const nextEmail = emailEdits[u.id];
        if (!nextEmail) return;
        try {
            await adminApi.updateEmail(u.id, nextEmail);
            message.success(t('adminUsers.messages.emailUpdated'));
            setEmailEdits(prev => ({ ...prev, [u.id]: '' }));
            setSelectedUser(prev => (prev && prev.id === u.id ? { ...prev, email: nextEmail } : prev));
            load();
        } catch {
            message.error(t('adminUsers.messages.emailUpdateFailed'));
        }
    };

    const onDelete = async (u: ManagedUser) => {
        try {
            await adminApi.deleteUser(u.id);
            message.success(t('adminUsers.messages.userDeleted'));
            // Close panel if the deleted user is currently open
            if (selectedUser && selectedUser.id === u.id) {
                closePanel();
            }
            load();
        } catch {
            message.error(t('adminUsers.messages.deleteFailed'));
        }
    };

    const columns: ColumnsType<ManagedUser> = [
        { title: t('adminUsers.table.columns.id'), dataIndex: 'id', key: 'id', width: 80 },
        { title: t('adminUsers.table.columns.username'), dataIndex: 'username', key: 'username' },
        {
            title: t('adminUsers.table.columns.status'), key: 'roles', render: (_: unknown, u: ManagedUser) => (
                <Space>
                    {u.isAdmin ? <Tag color="gold">{t('adminUsers.tags.admin')}</Tag> : <Tag>{t('adminUsers.tags.user')}</Tag>}
                    {u.isManager ? <Tag color="blue">{t('adminUsers.tags.manager')}</Tag> : null}
                    {u.locked ? <Tag color="red">{t('adminUsers.tags.locked')}</Tag> : null}
                </Space>
            )
        },
        {
            title: t('adminUsers.table.columns.manage'), key: 'manage', width: 120, render: (_: unknown, u: ManagedUser) => (
                <Button size="small" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); openPanel(u); }}>{t('adminUsers.table.open')}</Button>
            )
        },
    ];

    const openPanel = (u: ManagedUser) => {
        setSelectedUser(u);
        setEmailEdits(prev => ({ ...prev, [u.id]: (isOnlyManager && u.isAdmin) ? '' : u.email }));
        setPanelOpen(true);
        // navigate to detail route for deep-linkability
        navigate(`/admin/users/${u.id}`);
    };

    const closePanel = () => {
        setPanelOpen(false);
        setSelectedUser(null);
        // navigate back to list
        navigate(`/admin/users`);
    };

    // Zugriff: Admins ODER Manager dürfen die Seite sehen
    if (!isAdmin && !isManager) {
        return (
            <div>
                <Card>
                    <Typography.Text>{t('adminUsers.noAccess')}</Typography.Text>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div ref={containerRef}>
                <Card
                    title={<Space><UserSwitchOutlined />{t('adminUsers.title')}</Space>}
                    extra={<Button icon={<ReloadOutlined />} onClick={load}>{t('adminUsers.refresh')}</Button>}
                    bodyStyle={{ padding: isPortrait ? '8px 10px 12px' : '16px' }}
                    style={isPortrait ? { margin: '0 8px' } : undefined}
                >
                    <Table<ManagedUser>
                        rowKey="id"
                        columns={columns}
                        dataSource={pagedUsers}
                        loading={loading}
                        pagination={false}
                        onRow={(u) => ({ onClick: () => openPanel(u) })}
                        size={isPortrait ? 'small' : 'middle'}
                    />
                    <div className={listStyles.pagination}>
                        <Pagination
                            total={users.length}
                            showSizeChanger={false}
                            pageSize={pageSize}
                            current={currentPage}
                            onChange={(page) => {
                                setCurrentPage(page);
                                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        />
                    </div>
                </Card>
            </div>

            <Drawer
                title={selectedUser ? t('adminUsers.drawer.titleWithId', { id: selectedUser.id }) : t('adminUsers.drawer.title')}
                placement={isPortrait ? 'bottom' : 'right'}
                height={isPortrait ? drawerHeight : undefined}
                width={isPortrait ? undefined : drawerWidth}
                open={panelOpen}
                onClose={closePanel}
                destroyOnClose
                bodyStyle={{ overflow: 'auto', padding: 16, paddingBottom: 'env(safe-area-inset-bottom)' }}
                style={{ maxHeight: '100dvh' }}
            >
                {selectedUser && (
                    <div>
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label={t('adminUsers.drawer.fields.username')}>{selectedUser.username}</Descriptions.Item>
                            <Descriptions.Item label={t('adminUsers.drawer.fields.email')}>
                                {isOnlyManager && selectedUser.isAdmin ? (
                                    <Typography.Text type="secondary">{t('adminUsers.drawer.fields.confidential')}</Typography.Text>
                                ) : (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: isPortrait ? 'wrap' as const : 'nowrap' as const }}>
                                        <Input
                                            size="middle"
                                            style={{ flex: '1 1 240px', minWidth: 200 }}
                                            value={emailEdits[selectedUser.id] ?? selectedUser.email}
                                            onChange={e => setEmailEdits(prev => ({ ...prev, [selectedUser.id]: e.target.value }))}
                                            disabled={!(isAdmin || isManager)}
                                        />
                                        <Button
                                            icon={<MailOutlined />}
                                            onClick={() => onUpdateEmail(selectedUser)}
                                            disabled={!(isAdmin || isManager)}
                                            block={isPortrait}
                                            style={{ alignSelf: isPortrait ? 'stretch' : 'center' }}
                                        >
                                            {t('adminUsers.drawer.buttons.save')}
                                        </Button>
                                    </div>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('adminUsers.drawer.fields.roles')}>
                                <Space wrap>
                                    <span>
                                        {t('adminUsers.tags.admin')}: <Switch checked={!!selectedUser.isAdmin} onChange={(v) => onToggleAdmin(selectedUser, v)} disabled={!isAdmin} />
                                    </span>
                                    <span>
                                        {t('adminUsers.tags.manager')}: <Switch checked={!!selectedUser.isManager} onChange={(v) => onToggleManager(selectedUser, v)} disabled={!(isAdmin || isManager)} />
                                    </span>
                                    <Button size="small" icon={selectedUser.locked ? <UnlockOutlined /> : <LockOutlined />} onClick={() => onToggleLocked(selectedUser, !selectedUser.locked)} disabled={!(isAdmin || isManager)}>
                                        {selectedUser.locked ? t('adminUsers.drawer.buttons.unlock') : t('adminUsers.drawer.buttons.lock')}
                                    </Button>
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Space>
                            <Popconfirm title={t('adminUsers.drawer.confirmDelete.title')} onConfirm={() => onDelete(selectedUser)} okText={t('adminUsers.drawer.confirmDelete.ok')} cancelText={t('adminUsers.drawer.confirmDelete.cancel')} disabled={!isAdmin}>
                                <Button danger icon={<DeleteOutlined />} disabled={!isAdmin}>{t('adminUsers.drawer.buttons.delete')}</Button>
                            </Popconfirm>
                            <Button onClick={closePanel}>{t('adminUsers.drawer.buttons.close')}</Button>
                        </Space>
                    </div>
                )}
            </Drawer>
        </>
    );
}
