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
    Progress
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
    ShareAltOutlined
} from '@ant-design/icons';
import { groupsApiService } from '../../../hooks/useGroupsApi';
import { GroupModel, GroupMemberModel, UserModel } from '../../../shared/Models';
import { useApi, useMutation } from '../../../hooks/useApi';
import { ImageCompressionUtils } from '../../../utils/imageCompressionUtils';
import InviteButton from '../../invite/InviteButton';
import styles from './GroupManagement.module.css';
import { useStore } from '~/store/Store';
import { useTranslation } from 'react-i18next';

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
                                    Gruppe erstellen
                                </Button>
                                <Button
                                    icon={<LoginOutlined />}
                                    onClick={() => setJoinModalVisible(true)}
                                >
                                    Gruppe beitreten
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
                                        >
                                            <span className={styles.desktopText}>{t('groups.buttons.members')}</span> ({group.memberCount})
                                        </Button>,
                                        <Button
                                            key="edit"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditGroup(group)}
                                            disabled={group.role !== 'admin' && !group.isCreator}
                                            size="small"
                                        >
                                            <span className={styles.desktopText}>{t('groups.buttons.edit')}</span>
                                        </Button>,
                                        <InviteButton
                                            key={`invite-${group.id}`}
                                            groupId={group.id.toString()}
                                            groupName={group.name}
                                            inviterName={getUserName()}
                                            size="small"
                                            disabled={group.role !== 'admin'}
                                        />,
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
                                                    console.warn('Avatar image failed to load for group:', group.name);
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
                                                    Beigetreten: {new Date(member.joinedAt).toLocaleDateString('de-DE')}
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
        </div>
    );
}
