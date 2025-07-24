import React, { useState } from 'react';
import { Button, Modal, Input, Typography, Space, Alert, message, Divider } from 'antd';
import { ShareAltOutlined, CopyOutlined, LinkOutlined, UserAddOutlined } from '@ant-design/icons';
import { InviteManager } from '../../utils/inviteManager';

const { Text, Paragraph } = Typography;

interface InviteButtonProps {
    groupId: string;
    groupName: string;
    inviterName: string;
    className?: string;
    type?: 'primary' | 'default' | 'link';
    size?: 'small' | 'middle' | 'large';
    disabled?: boolean;
}

const InviteButton: React.FC<InviteButtonProps> = ({
    groupId,
    groupName,
    inviterName,
    className,
    type = 'default',
    size = 'middle',
    disabled = false
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [inviteUrl, setInviteUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const generateInviteLink = async () => {
        try {
            setLoading(true);

            // Erstelle Invite-Token
            const token = InviteManager.createInviteToken(
                groupId,
                groupName,
                'current-user-id', // TODO: Aus Store holen
                inviterName
            );

            // Generiere URL
            const url = InviteManager.createInviteUrl(token);
            setInviteUrl(url);

            console.log('Invite link generated:', url);
        } catch (error) {
            console.error('Fehler beim Erstellen des Invite-Links:', error);
            message.error('Fehler beim Erstellen des Einladungslinks');
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = () => {
        setModalVisible(true);
        if (!inviteUrl) {
            generateInviteLink();
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            message.success('Einladungslink in die Zwischenablage kopiert!');
        } catch (error) {
            console.error('Fehler beim Kopieren:', error);
            // Fallback für ältere Browser
            const textArea = document.createElement('textarea');
            textArea.value = inviteUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            message.success('Einladungslink kopiert!');
        }
    };

    const handleShareViaEmail = () => {
        const subject = encodeURIComponent(`Einladung zur Gruppe "${groupName}"`);
        const body = encodeURIComponent(
            `Hallo!\n\n` +
            `${inviterName} hat dich zur Gruppe "${groupName}" in der Prepper App eingeladen.\n\n` +
            `Klicke auf den folgenden Link, um der Gruppe beizutreten:\n` +
            `${inviteUrl}\n\n` +
            `Falls du noch kein Konto hast, kannst du dich kostenlos registrieren.\n\n` +
            `Viele Grüße!\n` +
            `Das Prepper App Team`
        );

        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        window.open(mailtoLink);
    };

    const handleShareViaWhatsApp = () => {
        const text = encodeURIComponent(
            `🏠 Einladung zur Gruppe "${groupName}"\n\n` +
            `${inviterName} hat dich zur Prepper App eingeladen!\n\n` +
            `👉 ${inviteUrl}\n\n` +
            `Tritt bei und teile deine Notvorräte mit der Gruppe! 📦`
        );

        const whatsappUrl = `https://wa.me/?text=${text}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <Button
                type={type}
                size={size}
                icon={<UserAddOutlined />}
                onClick={handleShowModal}
                disabled={disabled}
                className={className}
            >
                Einladungslink
            </Button>

            <Modal
                title={
                    <Space>
                        <ShareAltOutlined />
                        Gruppe &quot;{groupName}&quot; teilen
                    </Space>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Alert
                        message="Einladungslink erstellen"
                        description="Teile diesen Link mit Personen, die du zur Gruppe einladen möchtest. Der Link ist 7 Tage gültig."
                        type="info"
                        showIcon
                    />

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <Text>Erstelle Einladungslink...</Text>
                        </div>
                    ) : (
                        inviteUrl && (
                            <div>
                                <Text strong>Einladungslink:</Text>
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
                                            onClick={handleCopyLink}
                                        >
                                            Link kopieren
                                        </Button>
                                        <Button
                                            icon={<span>📧</span>}
                                            onClick={handleShareViaEmail}
                                        >
                                            Per E-Mail teilen
                                        </Button>
                                        <Button
                                            icon={<span>💬</span>}
                                            onClick={handleShareViaWhatsApp}
                                        >
                                            Per WhatsApp teilen
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        )
                    )}

                    <Divider />

                    <div>
                        <Text strong>So funktioniert&apos;s:</Text>
                        <Paragraph style={{ marginTop: 8 }}>
                            <ul style={{ paddingLeft: 20 }}>
                                <li>Teile den Link mit Personen, die du einladen möchtest</li>
                                <li>Wenn sie bereits ein Konto haben, treten sie sofort der Gruppe bei</li>
                                <li>Neue Benutzer werden zur Registrierung geleitet</li>
                                <li>Nach der Anmeldung werden sie automatisch der Gruppe hinzugefügt</li>
                            </ul>
                        </Paragraph>
                    </div>

                    <Alert
                        message="Sicherheitshinweis"
                        description="Teile Einladungslinks nur mit vertrauenswürdigen Personen. Jeder mit dem Link kann der Gruppe beitreten."
                        type="warning"
                        showIcon
                        style={{ fontSize: 12 }}
                    />
                </Space>
            </Modal>
        </>
    );
};

export default InviteButton;
