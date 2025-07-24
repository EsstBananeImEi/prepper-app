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
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    UserOutlined,
    MailOutlined,
    CopyOutlined,
    UsergroupAddOutlined,
    ExclamationCircleOutlined,
    LoginOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { groupsApiService } from '../../../hooks/useGroupsApi';
import { GroupModel, GroupMemberModel } from '../../../shared/Models';
import { useApi, useMutation } from '../../../hooks/useApi';
import styles from './GroupManagement.module.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CreateGroupForm {
    name: string;
    description?: string;
}

interface InviteUserForm {
    email: string;
}

interface JoinGroupForm {
    inviteCode: string;
}

export default function GroupManagement(): React.ReactElement {
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [membersModalVisible, setMembersModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupModel | null>(null);
    const [groupMembers, setGroupMembers] = useState<GroupMemberModel[]>([]);

    const [createForm] = Form.useForm<CreateGroupForm>();
    const [inviteForm] = Form.useForm<InviteUserForm>();
    const [joinForm] = Form.useForm<JoinGroupForm>();

    // API Hooks
    const { data: groups, loading: groupsLoading, refetch: refetchGroups } = useApi(
        () => groupsApiService.getUserGroups(),
        []
    );

    const { mutate: createGroup, loading: createLoading } = useMutation(
        (data: CreateGroupForm) => groupsApiService.createGroup(data),
        {
            onSuccess: () => {
                message.success('Gruppe erfolgreich erstellt');
                setCreateModalVisible(false);
                createForm.resetFields();
                refetchGroups();
            }
        }
    );

    const { mutate: deleteGroup, loading: deleteLoading } = useMutation(
        (groupId: number) => groupsApiService.deleteGroup(groupId),
        {
            onSuccess: () => {
                message.success('Gruppe erfolgreich gelöscht');
                refetchGroups();
            }
        }
    );

    const { mutate: inviteUser, loading: inviteLoading } = useMutation(
        ({ groupId, email }: { groupId: number; email: string }) =>
            groupsApiService.inviteUserToGroup(groupId, { groupId, invitedEmail: email }),
        {
            onSuccess: () => {
                message.success('Einladung erfolgreich versendet');
                setInviteModalVisible(false);
                inviteForm.resetFields();
            }
        }
    );

    const { mutate: joinGroup, loading: joinLoading } = useMutation(
        (inviteCode: string) => groupsApiService.joinGroupByCode(inviteCode),
        {
            // This mutation handles joining a group by invite code
            /* eslint-disable @typescript-eslint/no-explicit-any */

            onSuccess: (data: any) => {
                message.success(`Erfolgreich der Gruppe "${data?.group.name}" beigetreten`);
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
                message.success('Gruppe erfolgreich verlassen');
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
            message.error('Fehler beim Laden der Gruppenmitglieder');
        }
    };

    const handleCopyInviteCode = (inviteCode: string) => {
        navigator.clipboard.writeText(inviteCode);
        message.success('Einladungscode kopiert');
    };

    const getRoleColor = (role: string): string => {
        switch (role) {
            case 'admin': return 'red';
            case 'member': return 'blue';
            default: return 'default';
        }
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
                title={
                    <div className={styles.header}>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>Gruppenverwaltung</Title>
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
                    <div style={{ padding: '16px' }}>
                        <List
                            dataSource={groups}
                            split={false}
                            renderItem={(group) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="members"
                                            icon={<UserOutlined />}
                                            onClick={() => handleShowMembers(group)}
                                            size="small"
                                        >
                                            <span className="desktop-text">Mitglieder</span> ({group.memberCount})
                                        </Button>,
                                        <Button
                                            key="invite"
                                            icon={<MailOutlined />}
                                            onClick={() => {
                                                setSelectedGroup(group);
                                                setInviteModalVisible(true);
                                            }}
                                            disabled={group.role !== 'admin'}
                                            size="small"
                                        >
                                            <span className="desktop-text">Einladen</span>
                                        </Button>,
                                        <Tooltip title="Einladungscode kopieren" key="copy">
                                            <Button
                                                icon={<CopyOutlined />}
                                                onClick={() => handleCopyInviteCode(group.inviteCode)}
                                                size="small"
                                            />
                                        </Tooltip>,
                                        group.isCreator ? (
                                            <Popconfirm
                                                key="delete"
                                                title="Sind Sie sicher, dass Sie diese Gruppe löschen möchten?"
                                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                                                onConfirm={() => deleteGroup(group.id)}
                                                okText="Ja"
                                                cancelText="Nein"
                                            >
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    loading={deleteLoading}
                                                    size="small"
                                                >
                                                    <span className="mobile-text">Löschen</span>
                                                </Button>
                                            </Popconfirm>
                                        ) : (
                                            <Popconfirm
                                                key="leave"
                                                title="Sind Sie sicher, dass Sie diese Gruppe verlassen möchten?"
                                                icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                                                onConfirm={() => leaveGroup(group.id)}
                                                okText="Ja"
                                                cancelText="Nein"
                                            >
                                                <Button
                                                    icon={<LogoutOutlined />}
                                                    loading={leaveLoading}
                                                    size="small"
                                                >
                                                    Verlassen
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
                                        avatar={<Avatar icon={<UsergroupAddOutlined />} size="large" />}
                                        title={
                                            <Space wrap>
                                                <span style={{ fontWeight: 'bold' }}>{group.name}</span>
                                                <Tag color={getRoleColor(group.role)}>
                                                    {getRoleText(group.role)}
                                                </Tag>
                                                {group.isCreator && <Tag color="gold">Ersteller</Tag>}
                                            </Space>
                                        }
                                        description={
                                            <div>
                                                {group.description && (
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <Text>{group.description}</Text>
                                                    </div>
                                                )}
                                                <Text type="secondary">
                                                    Einladungscode: <Text code copyable>{group.inviteCode}</Text>
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
                        <Title level={4} type="secondary">Keine Gruppen gefunden</Title>
                        <Text type="secondary">
                            Erstellen Sie eine neue Gruppe oder treten Sie einer bestehenden bei.
                        </Text>
                    </div>
                )}
            </Card>

            {/* Gruppe erstellen Modal */}
            <Modal
                title="Neue Gruppe erstellen"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={createGroup}
                >
                    <Form.Item
                        label="Gruppenname"
                        name="name"
                        rules={[
                            { required: true, message: 'Bitte geben Sie einen Gruppennamen ein' },
                            { min: 3, message: 'Der Gruppenname muss mindestens 3 Zeichen lang sein' }
                        ]}
                    >
                        <Input placeholder="z.B. Familie Schmidt" />
                    </Form.Item>

                    <Form.Item
                        label="Beschreibung (optional)"
                        name="description"
                    >
                        <TextArea
                            placeholder="Beschreibung der Gruppe..."
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setCreateModalVisible(false)}>
                                Abbrechen
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createLoading}
                            >
                                Erstellen
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* User einladen Modal */}
            <Modal
                title={`Mitglied zu "${selectedGroup?.name}" einladen`}
                open={inviteModalVisible}
                onCancel={() => {
                    setInviteModalVisible(false);
                    inviteForm.resetFields();
                    setSelectedGroup(null);
                }}
                footer={null}
            >
                <Form
                    form={inviteForm}
                    layout="vertical"
                    onFinish={(values) => selectedGroup && inviteUser({ groupId: selectedGroup.id, email: values.email })}
                >
                    <Form.Item
                        label="E-Mail-Adresse"
                        name="email"
                        rules={[
                            { required: true, message: 'Bitte geben Sie eine E-Mail-Adresse ein' },
                            { type: 'email', message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein' }
                        ]}
                    >
                        <Input placeholder="benutzer@example.com" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setInviteModalVisible(false)}>
                                Abbrechen
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={inviteLoading}
                            >
                                Einladung senden
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Gruppe beitreten Modal */}
            <Modal
                title="Gruppe beitreten"
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
                        label="Einladungscode"
                        name="inviteCode"
                        rules={[
                            { required: true, message: 'Bitte geben Sie einen Einladungscode ein' },
                            { len: 8, message: 'Der Einladungscode muss 8 Zeichen lang sein' }
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
                                Abbrechen
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={joinLoading}
                            >
                                Beitreten
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Gruppenmitglieder Modal */}
            <Modal
                title={`Mitglieder von "${selectedGroup?.name}"`}
                open={membersModalVisible}
                onCancel={() => {
                    setMembersModalVisible(false);
                    setSelectedGroup(null);
                    setGroupMembers([]);
                }}
                footer={[
                    <Button key="close" onClick={() => setMembersModalVisible(false)}>
                        Schließen
                    </Button>
                ]}
                width={600}
            >
                <List
                    dataSource={groupMembers}
                    renderItem={(member) => (
                        <List.Item>
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
