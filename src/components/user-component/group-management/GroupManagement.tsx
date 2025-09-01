import React, { useState, useEffect } from 'react';
import {
    Card,
    List,
    Button,
    Modal,
    Form,
    Input,
    message,
    Space,
    Tag,
    Popconfirm,
    Typography,
    Divider,
    Avatar,
    Tooltip,
    Upload,
    Progress,
    Alert as AntdAlert
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    UserOutlined,
    CopyOutlined,
    UsergroupAddOutlined,
    ExclamationCircleOutlined,
    LoginOutlined,
    LogoutOutlined,
    EditOutlined,
    CameraOutlined,
    UploadOutlined,
    CompressOutlined,
    ShareAltOutlined,
    LinkOutlined,
    MailOutlined,
    SendOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { groupsApiService } from '../../../hooks/useGroupsApi';
import { GroupModel, GroupMemberModel, UserModel } from '../../../shared/Models';
import { useApi, useMutation } from '../../../hooks/useApi';
import { ImageCompressionUtils } from '../../../utils/imageCompressionUtils';
import InvitationManager from '../../invite/InvitationManager';
import { InviteManager } from '../../../utils/inviteManager';
import styles from './GroupManagement.module.css';
import { useStore } from '~/store/Store';
import { useTranslation } from 'react-i18next';
import logger from '../../../utils/logger';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CreateGroupForm {
    name: string;
    description?: string;
    image?: File;
}

interface UpdateGroupForm {
    name: string;
    description?: string;
    image?: File;
    removeImage?: boolean;
}

interface JoinGroupForm {
    inviteCode: string;
}

export default function GroupManagement(): React.ReactElement {
    const { t } = useTranslation();
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [membersModalVisible, setMembersModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupModel | null>(null);
    const [groupMembers, setGroupMembers] = useState<GroupMemberModel[]>([]);
    const [createImageFile, setCreateImageFile] = useState<File | null>(null);
    const [updateImageFile, setUpdateImageFile] = useState<File | null>(null);
    const [removeCurrentImage, setRemoveCurrentImage] = useState<boolean>(false);
    const [imageCompressionProgress, setImageCompressionProgress] = useState<number>(0);
    const [isCompressing, setIsCompressing] = useState<boolean>(false);

    // Invite modal state
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [inviteManagerVisible, setInviteManagerVisible] = useState(false);
    const [inviteUrl, setInviteUrl] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteSendingEmail, setInviteSendingEmail] = useState(false);
    const [inviteGroup, setInviteGroup] = useState<{ id: number; name: string } | null>(null);
    const [inviteEmailForm] = Form.useForm();

    const [createForm] = Form.useForm<CreateGroupForm>();
    const [updateForm] = Form.useForm<UpdateGroupForm>();
    const [joinForm] = Form.useForm<JoinGroupForm>();

    // API Hooks
    const { data: groups, loading: groupsLoading, refetch: refetchGroups } = useApi(
        () => groupsApiService.getUserGroups(),
        []
    );

    const { mutate: createGroup, loading: createLoading } = useMutation(
        (data: CreateGroupForm) => groupsApiService.createGroup({
            name: data.name,
            description: data.description,
            image: createImageFile || undefined
        }),
        {
            onSuccess: () => {
                message.success(t('groups.toasts.created'));
                setCreateModalVisible(false);
                createForm.resetFields();
                setCreateImageFile(null);
                refetchGroups();
            }
        }
    );

    const { mutate: updateGroup, loading: updateLoading } = useMutation(
        ({ groupId, data }: { groupId: number; data: UpdateGroupForm }) => groupsApiService.updateGroup(groupId, {
            name: data.name,
            description: data.description,
            image: removeCurrentImage ? undefined : (updateImageFile || undefined)
        }),
        {
            onSuccess: () => {
                message.success(t('groups.toasts.updated'));
                setUpdateModalVisible(false);
                updateForm.resetFields();
                setSelectedGroup(null);
                setUpdateImageFile(null);
                setRemoveCurrentImage(false);
                refetchGroups();
            }
        }
    );

    const { mutate: deleteGroup, loading: deleteLoading } = useMutation(
        (groupId: number) => groupsApiService.deleteGroup(groupId),
        {
            onSuccess: () => {
                message.success(t('groups.toasts.deleted'));
                refetchGroups();
            }
        }
    );

    const { mutate: removeUserFromGroup, loading: removeUserLoading } = useMutation(
        ({ groupId, userId }: { groupId: number; userId: number }) => groupsApiService.removeUserFromGroup(groupId, userId),
        {
            onSuccess: () => {
                message.success(t('groups.toasts.removedUser'));
                if (selectedGroup) {
                    handleShowMembers(selectedGroup);
                }
            }
        }
    );

    const { mutate: joinGroup, loading: joinLoading } = useMutation(
        (inviteCode: string) => groupsApiService.joinGroupByCode(inviteCode),
        {
            // This mutation handles joining a group by invite code
            /* eslint-disable @typescript-eslint/no-explicit-any */

            onSuccess: (data: any) => {
                message.success(t('groups.toasts.joinSuccess', { name: data?.group.name }));
                setJoinModalVisible(false);
                joinForm.resetFields();
                refetchGroups();
            }
        }
    );

    const { mutate: leaveGroup, loading: leaveLoading } = useMutation(
        (groupId: number) => groupsApiService.leaveGroup(groupId),
        {
            onSuccess: () => {
                message.success(t('groups.toasts.left'));
                refetchGroups();
            }
        }
    );

    const handleShowMembers = async (group: GroupModel) => {
        setSelectedGroup(group);
        try {
            const members = await groupsApiService.getGroupMembers(group.id);
            setGroupMembers(members);
            setMembersModalVisible(true);
        } catch (error) {
            message.error(t('groups.toasts.loadMembersError'));
        }
    };

    const handleEditGroup = (group: GroupModel) => {
        setSelectedGroup(group);
        setUpdateImageFile(null);
        setRemoveCurrentImage(false);
        updateForm.setFieldsValue({
            name: group.name,
            description: group.description || ''
        });
        setUpdateModalVisible(true);
    };

    const handleRemoveUser = async (userId: number) => {
        if (selectedGroup) {
            removeUserFromGroup({ groupId: selectedGroup.id, userId });
        }
    };

    const handleCopyInviteCode = (inviteCode: string) => {
        navigator.clipboard.writeText(inviteCode);
        message.success(t('groups.toasts.inviteCopied'));
    };

    const handleOpenInvite = async (group: GroupModel) => {
        setInviteGroup({ id: group.id, name: group.name });
        setInviteModalVisible(true);
        if (!inviteUrl) {
            await generateInviteLink(group.id);
        }
    };

    const generateInviteLink = async (groupId: number) => {
        try {
            setInviteLoading(true);
            const response = await groupsApiService.generateInviteToken(groupId);
            const backendToken = response.inviteToken;
            const url = InviteManager.createInviteUrl(backendToken);
            setInviteUrl(url);
        } catch (error) {
            logger.error('Fehler beim Erstellen des Invite-Links:', error);
            message.error(t('groups.invite.errorCreateLink'));
        } finally {
            setInviteLoading(false);
        }
    };

    const handleCopyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            message.success(t('groups.invite.linkCopiedClipboard'));
        } catch (error) {
            logger.error('Fehler beim Kopieren:', error);
            const textArea = document.createElement('textarea');
            textArea.value = inviteUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            message.success(t('groups.invite.linkCopied'));
        }
    };

    const handleShareInviteViaEmail = () => {
        if (!inviteGroup) return;
        const subject = encodeURIComponent(t('groups.invite.email.subject', { name: inviteGroup.name }));
        const body = encodeURIComponent(
            t('groups.invite.email.body', {
                inviter: getUserName(),
                name: inviteGroup.name,
                url: inviteUrl
            })
        );

        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        window.open(mailtoLink);
    };

    const handleShareInviteViaWhatsApp = () => {
        if (!inviteGroup) return;
        const text = encodeURIComponent(
            t('groups.invite.whatsapp.text', {
                name: inviteGroup.name,
                inviter: getUserName(),
                url: inviteUrl
            })
        );
        const whatsappUrl = `https://wa.me/?text=${text}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSendInviteEmailViaBackend = async (values: { email: string }) => {
        if (!inviteGroup) return;
        try {
            setInviteSendingEmail(true);
            const response = await groupsApiService.inviteUserToGroup(inviteGroup.id, {
                groupId: inviteGroup.id,
                invitedEmail: values.email,
                inviteToken: '',
                inviteUrl: ''
            });
            const backendToken = response.inviteToken;
            const url = InviteManager.createInviteUrl(backendToken);
            setInviteUrl(url);
            message.success(t('groups.invite.emailSendSuccess', { email: values.email }));
            inviteEmailForm.resetFields();
        } catch (error) {
            logger.error('Fehler beim Senden der Email-Einladung:', error);
            message.error(t('groups.invite.emailSendError'));
        } finally {
            setInviteSendingEmail(false);
        }
    };

    const handleCreateImageUpload = async (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error(t('groups.toasts.imageSelectError'));
            return false;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error(t('groups.toasts.imageTooLarge'));
            return false;
        }

        setIsCompressing(true);
        setImageCompressionProgress(0);

        try {
            // Show compression progress
            const progressInterval = setInterval(() => {
                setImageCompressionProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const compressionOptions = ImageCompressionUtils.getOptimalCompressionSettings(file.size);
            const compressedFile = await ImageCompressionUtils.compressImage(file, compressionOptions);

            clearInterval(progressInterval);
            setImageCompressionProgress(100);

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

            setCreateImageFile(compressedFile);
            message.success(t('groups.toasts.imageCompressed', { ratio: compressionRatio }));

            setTimeout(() => {
                setIsCompressing(false);
                setImageCompressionProgress(0);
            }, 1000);
        } catch (error) {
            message.error(t('groups.toasts.imageCompressionError'));
            setIsCompressing(false);
            setImageCompressionProgress(0);
        }

        return false;
    };

    const handleUpdateImageUpload = async (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error(t('groups.toasts.imageSelectError'));
            return false;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error(t('groups.toasts.imageTooLarge'));
            return false;
        }

        setIsCompressing(true);
        setImageCompressionProgress(0);

        try {
            // Show compression progress
            const progressInterval = setInterval(() => {
                setImageCompressionProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const compressionOptions = ImageCompressionUtils.getOptimalCompressionSettings(file.size);
            const compressedFile = await ImageCompressionUtils.compressImage(file, compressionOptions);

            clearInterval(progressInterval);
            setImageCompressionProgress(100);

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

            setUpdateImageFile(compressedFile);
            message.success(t('groups.toasts.imageCompressed', { ratio: compressionRatio }));

            setTimeout(() => {
                setIsCompressing(false);
                setImageCompressionProgress(0);
            }, 1000);
        } catch (error) {
            message.error(t('groups.toasts.imageCompressionError'));
            setIsCompressing(false);
            setImageCompressionProgress(0);
        }

        return false;
    };

    const getRoleColor = (role: string): string => {
        switch (role) {
            case 'admin': return 'red';
            case 'member': return 'blue';
            default: return 'default';
        }
    };

    const getUserName = (): string => {
        const user: UserModel | null = JSON.parse(localStorage.getItem('user') || 'null');
        return user?.username || user?.email || 'Unbekannt';
    };

    const getRoleText = (role: string): string => {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'member': return 'Mitglied';
            default: return role;
        }
    };

    return (
        <div className={styles.container}>
            <Card
                className={styles.card}
                title={
                    <div className={styles.header}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>{t('groups.header')}</Title>
                        </div>
                        <div>
                            <Space size="small" wrap>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setCreateModalVisible(true)}
                                >
                                    {t('groups.buttons.create')}
                                </Button>
                                <Button
                                    icon={<LoginOutlined />}
                                    onClick={() => setJoinModalVisible(true)}
                                >
                                    {t('groups.buttons.join')}
                                </Button>
                            </Space>
                        </div>
                    </div>
                }
                loading={groupsLoading}
                bodyStyle={{ padding: '0' }}
            >
                {groups && groups.length > 0 ? (
                    <div className={styles.listContainer} style={{ padding: '16px' }}>
                        <List
                            dataSource={groups}
                            split={false}
                            renderItem={(group) => (
                                <List.Item
                                    className={styles.listItem}
                                    actions={[
                                        <Button
                                            key="members"
                                            icon={<UserOutlined />}
                                            onClick={() => handleShowMembers(group)}
                                            size="small"
                                            style={{ width: '100%' }}
                                            className={styles.actionSmall}
                                        >
                                            <span className={styles.desktopText}>{t('groups.buttons.members')}</span> ({group.memberCount})
                                        </Button>,
                                        <Button
                                            key={`invite-${group.id}`}
                                            icon={<UsergroupAddOutlined />}
                                            onClick={() => handleOpenInvite(group)}
                                            disabled={group.role !== 'admin'}
                                            size="small"
                                            style={{ width: '100%' }}
                                            className={styles.actionSmall}
                                        >
                                            <span className={styles.desktopText}>{t('groups.buttons.inviteLink')}</span>
                                        </Button>,
                                        <Button
                                            key="edit"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditGroup(group)}
                                            disabled={group.role !== 'admin' && !group.isCreator}
                                            size="small"
                                            style={{ width: '100%' }}
                                            className={styles.actionSmall}
                                        >
                                            <span className={styles.desktopText}>{t('groups.buttons.edit')}</span>
                                        </Button>,
                                        group.isCreator ? (
                                            <Popconfirm
                                                key="delete"
                                                title={t('groups.confirms.deleteTitle')}
                                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                                                onConfirm={() => deleteGroup(group.id)}
                                                okText={t('groups.confirms.ok')}
                                                cancelText={t('groups.confirms.cancel')}
                                            >
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    loading={deleteLoading}
                                                    size="small"
                                                    style={{ width: '100%' }}
                                                    className={styles.actionSmall}
                                                >
                                                    <span className={styles.mobileText}>{t('groups.buttons.delete')}</span>
                                                </Button>
                                            </Popconfirm>
                                        ) : (
                                            <Popconfirm
                                                key="leave"
                                                title={t('groups.confirms.leaveTitle')}
                                                icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                                                onConfirm={() => leaveGroup(group.id)}
                                                okText={t('groups.confirms.ok')}
                                                cancelText={t('groups.confirms.cancel')}
                                            >
                                                <Button
                                                    icon={<LogoutOutlined />}
                                                    loading={leaveLoading}
                                                    size="small"
                                                    style={{ width: '100%' }}
                                                    className={styles.actionSmall}
                                                >
                                                    {t('groups.buttons.leave')}
                                                </Button>
                                            </Popconfirm>
                                        )
                                    ]}
                                    style={{
                                        marginBottom: '8px',
                                        borderRadius: '8px',
                                        border: '1px solid #f0f0f0',
                                        background: '#fafafa'
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={group.image || undefined}
                                                icon={!group.image && <UsergroupAddOutlined />}
                                                size="large"
                                                onError={() => {
                                                    logger.warn('Avatar image failed to load for group:', group.name);
                                                    return false;
                                                }}
                                            />
                                        }
                                        title={
                                            <Space wrap>
                                                <span style={{ fontWeight: 'bold' }}>{group.name}</span>
                                                <Tag color={getRoleColor(group.role)}>
                                                    {getRoleText(group.role)}
                                                </Tag>
                                                {group.isCreator && <Tag color="gold">{t('groups.labels.creator')}</Tag>}
                                            </Space>
                                        }
                                        description={
                                            <div style={{
                                                textWrap: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '100%'
                                            }}>
                                                {group.description && (
                                                    <div style={{
                                                        marginBottom: '8px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <Text>{group.description}</Text>
                                                    </div>
                                                )}
                                                <Text type="secondary" style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block'
                                                }}>
                                                    {t('groups.labels.inviteCode')}: <Text code copyable>{group.inviteCode}</Text>
                                                </Text>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <UsergroupAddOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                        <Title level={4} type="secondary">{t('groups.empty.title')}</Title>
                        <Text type="secondary">{t('groups.empty.subtitle')}</Text>
                    </div>
                )}
            </Card>

            {/* Gruppe erstellen Modal */}
            <Modal
                title={t('groups.modals.createTitle')}
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                    setCreateImageFile(null);
                }}
                footer={null}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={createGroup}
                >
                    <Form.Item
                        label={t('groups.labels.groupName')}
                        name="name"
                        rules={[
                            { required: true, message: t('groups.placeholders.groupName') },
                            { min: 3, message: '3+' }
                        ]}
                    >
                        <Input placeholder={t('groups.placeholders.groupName')} />
                    </Form.Item>

                    <Form.Item
                        label={t('groups.labels.descriptionOptional')}
                        name="description"
                    >
                        <TextArea
                            placeholder={t('groups.placeholders.groupDescription')}
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item label={t('groups.labels.groupImageOptional')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Avatar
                                src={createImageFile ? URL.createObjectURL(createImageFile) : undefined}
                                icon={!createImageFile && <UsergroupAddOutlined />}
                                size={64}
                            />
                            <div>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={handleCreateImageUpload}
                                    disabled={isCompressing}
                                >
                                    <Button icon={<UploadOutlined />} loading={isCompressing}>
                                        {isCompressing ? t('groups.ui.compressing') : t('groups.ui.selectImage')}
                                    </Button>
                                </Upload>
                                {createImageFile && !isCompressing && (
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setCreateImageFile(null)}
                                    >
                                        {t('groups.buttons.remove')}
                                    </Button>
                                )}
                                {isCompressing && (
                                    <div style={{ marginTop: '8px', width: '200px' }}>
                                        <Progress
                                            percent={imageCompressionProgress}
                                            size="small"
                                            status="active"
                                            format={() => <CompressOutlined />}
                                        />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {t('groups.ui.imageBeingCompressed')}
                                        </Text>
                                    </div>
                                )}
                                <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                                    {t('groups.ui.supportedFormats')}<br />
                                    {t('groups.ui.imagesOptimized')}
                                </div>
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setCreateModalVisible(false);
                                setCreateImageFile(null);
                            }}>
                                {t('groups.modals.cancel')}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createLoading}
                            >
                                {t('groups.modals.create')}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Gruppe bearbeiten Modal */}
            <Modal
                title={t('groups.modals.editTitle')}
                open={updateModalVisible}
                onCancel={() => {
                    setUpdateModalVisible(false);
                    updateForm.resetFields();
                    setSelectedGroup(null);
                    setUpdateImageFile(null);
                    setRemoveCurrentImage(false);
                }}
                footer={null}
            >
                <Form
                    form={updateForm}
                    layout="vertical"
                    onFinish={(values) => selectedGroup && updateGroup({ groupId: selectedGroup.id, data: values })}
                >
                    <Form.Item
                        label={t('groups.labels.groupName')}
                        name="name"
                        rules={[
                            { required: true, message: t('groups.placeholders.groupName') },
                            { min: 3, message: '3+' }
                        ]}
                    >
                        <Input placeholder={t('groups.placeholders.groupName')} />
                    </Form.Item>

                    <Form.Item
                        label={t('groups.labels.descriptionOptional')}
                        name="description"
                    >
                        <TextArea
                            placeholder={t('groups.placeholders.groupDescription')}
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item label={t('groups.labels.groupImageOptional')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Avatar
                                src={updateImageFile ? URL.createObjectURL(updateImageFile) : (removeCurrentImage ? undefined : selectedGroup?.image)}
                                icon={(!updateImageFile && (removeCurrentImage || !selectedGroup?.image)) && <UsergroupAddOutlined />}
                                size={64}
                            />
                            <div>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={handleUpdateImageUpload}
                                    disabled={isCompressing}
                                >
                                    <Button icon={<UploadOutlined />} loading={isCompressing}>
                                        {isCompressing ? t('groups.ui.compressing') : updateImageFile ? t('groups.ui.chooseAnotherImage') : (selectedGroup?.image && !removeCurrentImage ? t('groups.ui.changeImage') : t('groups.ui.selectImage'))}
                                    </Button>
                                </Upload>
                                {(updateImageFile || (selectedGroup?.image && !removeCurrentImage)) && !isCompressing && (
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => {
                                            if (updateImageFile) {
                                                setUpdateImageFile(null);
                                            } else {
                                                setRemoveCurrentImage(true);
                                            }
                                        }}
                                    >
                                        {updateImageFile ? t('groups.ui.removeNewSelection') : t('groups.ui.removeCurrentImage')}
                                    </Button>
                                )}
                                {isCompressing && (
                                    <div style={{ marginTop: '8px', width: '200px' }}>
                                        <Progress
                                            percent={imageCompressionProgress}
                                            size="small"
                                            status="active"
                                            format={() => <CompressOutlined />}
                                        />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {t('groups.ui.imageBeingCompressed')}
                                        </Text>
                                    </div>
                                )}
                                <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
                                    {t('groups.ui.supportedFormats')}<br />
                                    {t('groups.ui.imagesOptimized')}
                                </div>
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setUpdateModalVisible(false);
                                setUpdateImageFile(null);
                                setRemoveCurrentImage(false);
                            }}>
                                {t('groups.modals.cancel')}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={updateLoading}
                            >
                                {t('groups.modals.save')}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Gruppe beitreten Modal */}
            <Modal
                title={t('groups.modals.joinTitle')}
                open={joinModalVisible}
                onCancel={() => {
                    setJoinModalVisible(false);
                    joinForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={joinForm}
                    layout="vertical"
                    onFinish={(values) => joinGroup(values.inviteCode)}
                >
                    <Form.Item
                        label={t('groups.labels.inviteCode')}
                        name="inviteCode"
                        rules={[
                            { required: true, message: t('groups.labels.inviteCode') },
                            { len: 8, message: '8' }
                        ]}
                    >
                        <Input
                            placeholder="z.B. ABC12345"
                            style={{ textTransform: 'uppercase' }}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase();
                                joinForm.setFieldsValue({ inviteCode: value });
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setJoinModalVisible(false)}>
                                {t('groups.modals.cancel')}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={joinLoading}
                            >
                                {t('groups.modals.join')}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Gruppenmitglieder Modal */}
            <Modal
                title={t('groups.modals.membersTitle', { name: selectedGroup?.name })}
                open={membersModalVisible}
                onCancel={() => {
                    setMembersModalVisible(false);
                    setSelectedGroup(null);
                    setGroupMembers([]);
                }}
                footer={[
                    <Button key="close" onClick={() => setMembersModalVisible(false)}>
                        {t('groups.buttons.close')}
                    </Button>
                ]}
                width={600}
            >
                <List
                    dataSource={groupMembers}
                    renderItem={(member) => (
                        <List.Item
                            actions={
                                selectedGroup?.role === 'admin' && member.role !== 'admin' ? [
                                    <Popconfirm
                                        key="remove"
                                        title={t('groups.confirms.removeUserTitle', { username: member.username })}
                                        icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                                        onConfirm={() => handleRemoveUser(member.id)}
                                        okText={t('groups.confirms.ok')}
                                        cancelText={t('groups.confirms.cancel')}
                                    >
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            loading={removeUserLoading}
                                        >
                                            {t('groups.buttons.remove')}
                                        </Button>
                                    </Popconfirm>
                                ] : undefined
                            }
                        >
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={
                                    <Space>
                                        {member.username}
                                        <Tag color={getRoleColor(member.role)}>
                                            {getRoleText(member.role)}
                                        </Tag>
                                    </Space>
                                }
                                description={
                                    <>
                                        <Text type="secondary">{member.email}</Text>
                                        {member.joinedAt && (
                                            <>
                                                <br />
                                                <Text type="secondary">
                                                    {t('groups.members.joinedAt', { date: new Date(member.joinedAt).toLocaleDateString() })}
                                                </Text>
                                            </>
                                        )}
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>

            {/* Einladungen Modal (ersetzt InviteButton) */}
            <Modal
                title={
                    <Space>
                        <ShareAltOutlined />
                        {inviteGroup ? t('groups.invite.shareTitleWithName', { name: inviteGroup.name }) : t('groups.invite.shareTitle')}
                    </Space>
                }
                open={inviteModalVisible}
                onCancel={() => setInviteModalVisible(false)}
                footer={null}
                width={600}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <AntdAlert
                        message={t('groups.invite.createLinkTitle')}
                        description={t('groups.invite.createLinkDesc')}
                        type="info"
                        showIcon
                    />

                    {inviteLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <Text>{t('groups.invite.creatingLink')}</Text>
                        </div>
                    ) : (
                        inviteUrl && (
                            <div>
                                <Text strong>{t('groups.invite.linkLabel')}</Text>
                                <div style={{
                                    marginTop: 8,
                                    padding: 12,
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: 6,
                                    border: '1px solid #d9d9d9'
                                }}>
                                    <Space style={{ width: '100%' }}>
                                        <LinkOutlined />
                                        <Text
                                            code
                                            style={{
                                                flex: 1,
                                                wordBreak: 'break-all',
                                                fontSize: 12
                                            }}
                                        >
                                            {inviteUrl}
                                        </Text>
                                    </Space>
                                </div>

                                <div style={{ marginTop: 16 }}>
                                    <Space wrap>
                                        <Button
                                            type="primary"
                                            icon={<CopyOutlined />}
                                            onClick={handleCopyInviteLink}
                                        >
                                            {t('groups.invite.copyLink')}
                                        </Button>
                                        <Button
                                            icon={<span>📧</span>}
                                            onClick={handleShareInviteViaEmail}
                                        >
                                            {t('groups.invite.shareByEmail')}
                                        </Button>
                                        <Button
                                            icon={<span>💬</span>}
                                            onClick={handleShareInviteViaWhatsApp}
                                        >
                                            {t('groups.invite.shareByWhatsApp')}
                                        </Button>
                                        <Button
                                            icon={<SettingOutlined />}
                                            onClick={() => setInviteManagerVisible(true)}
                                        >
                                            {t('groups.invite.manageInvites')}
                                        </Button>
                                    </Space>
                                </div>

                                <Divider />

                                <div>
                                    <Typography.Title level={5} style={{ margin: '0 0 16px 0' }}>
                                        <MailOutlined style={{ marginRight: 8 }} />
                                        {t('groups.invite.emailInviteTitle')}
                                    </Typography.Title>
                                    <Form
                                        form={inviteEmailForm}
                                        onFinish={handleSendInviteEmailViaBackend}
                                        layout="vertical"
                                    >
                                        <Form.Item
                                            name="email"
                                            rules={[
                                                { required: true, message: t('user.form.validation.emailRequired') },
                                                { type: 'email', message: t('user.form.validation.emailInvalid') }
                                            ]}
                                            style={{ marginBottom: 12 }}
                                        >
                                            <Input
                                                placeholder={t('groups.invite.emailPlaceholder')}
                                                prefix={<MailOutlined />}
                                            />
                                        </Form.Item>
                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SendOutlined />}
                                                loading={inviteSendingEmail}
                                                block
                                            >
                                                {inviteSendingEmail ? t('groups.invite.sendingEmail') : t('groups.invite.sendEmail')}
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                                        {t('groups.invite.emailAutoSendNote')}
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    <Divider />

                    <div>
                        <Text strong>{t('groups.invite.howItWorksTitle')}</Text>
                        <Typography.Paragraph style={{ marginTop: 8 }}>
                            <ul style={{ paddingLeft: 20 }}>
                                <li>{t('groups.invite.hiw.b1')}</li>
                                <li>{t('groups.invite.hiw.b2')}</li>
                                <li>{t('groups.invite.hiw.b3')}</li>
                                <li>{t('groups.invite.hiw.b4')}</li>
                            </ul>
                        </Typography.Paragraph>
                    </div>

                    <AntdAlert
                        message={t('groups.invite.security.title')}
                        description={t('groups.invite.security.desc')}
                        type="warning"
                        showIcon
                        style={{ fontSize: 12 }}
                    />
                </Space>
            </Modal>

            <InvitationManager
                groupId={inviteGroup?.id.toString() || ''}
                groupName={inviteGroup?.name || ''}
                visible={inviteManagerVisible}
                onClose={() => setInviteManagerVisible(false)}
            />
        </div>
    );
}
