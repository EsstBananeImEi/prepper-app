import React, { useState } from 'react';
import { Card, Typography, Space, Alert, Divider, Button, Modal, Spin } from 'antd';
import { SettingOutlined, BugOutlined, UserOutlined, InfoCircleOutlined, ExperimentOutlined, LockOutlined } from '@ant-design/icons';
import { useStore } from '../../store/Store';
import { useNavigate } from 'react-router-dom';
import AdminSettings from '../debug/AdminSettings';
import SecurityWarning from '../auth/SecurityWarning';
import { useAdminValidation } from '../../hooks/useAdminValidation';
import styles from './AdminPage.module.css';

const { Title, Text, Paragraph } = Typography;

export default function AdminPage() {
    const { store } = useStore();
    const navigate = useNavigate();
    const [debugPanelEnabled, setDebugPanelEnabled] = useState<boolean>(
        localStorage.getItem('debugPanelEnabled') === 'true'
    );
    const [modalVisible, setModalVisible] = useState(false);

    // Secure admin validation using server-side check
    const { isAdmin, isValidating, error } = useAdminValidation();

    const handleDebugPanelToggle = (enabled: boolean) => {
        setDebugPanelEnabled(enabled);
        localStorage.setItem('debugPanelEnabled', enabled.toString());
    };

    const showAdminInfo = () => {
        setModalVisible(true);
    };

    const goToDeveloperTesting = () => {
        navigate('/dev-testing');
    };

    // Show loading spinner while validating
    if (isValidating) {
        return (
            <div className={styles.container}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                }}>
                    <Space direction="vertical" align="center">
                        <Spin size="large" />
                        <Typography.Text type="secondary">
                            Berechtigung wird überprüft...
                        </Typography.Text>
                    </Space>
                </div>
            </div>
        );
    }

    // Show access denied if not admin (after validation completed)
    if (!isAdmin) {
        return (
            <div className={styles.container}>
                <Card className={styles.accessDeniedCard}>
                    <Alert
                        message="Zugriff verweigert"
                        description={
                            <div>
                                <p>
                                    <LockOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                    Sie haben keine Administrator-Berechtigung für diesen Bereich.
                                </p>
                                <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                                    <strong>Sicherheitsdetails:</strong><br />
                                    • Admin-Status wird server-seitig validiert<br />
                                    • Client-seitige Manipulation ist nicht möglich<br />
                                    • {error || 'Unbekannter Validierungsfehler'}
                                </p>
                            </div>
                        }
                        type="error"
                        showIcon
                        icon={<UserOutlined />}
                    />
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <Button type="primary" onClick={() => navigate('/')}>
                            Zur Startseite
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Security Warning for Developers */}
            <SecurityWarning />

            {/* Header */}
            <Card className={styles.headerCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.headerContent}>
                        <div>
                            <Title level={2} className={styles.title}>
                                <SettingOutlined className={styles.titleIcon} />
                                Administrator-Panel
                            </Title>
                            <Text type="secondary">
                                Erweiterte Einstellungen und Debugging-Tools
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            icon={<InfoCircleOutlined />}
                            onClick={showAdminInfo}
                            className={styles.infoButton}
                        >
                            Info
                        </Button>
                    </div>
                </Space>
            </Card>

            {/* Current User Info */}
            <Card title="Administrator-Status" className={styles.userInfoCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.userInfo}>
                        <Text strong>Aktueller Benutzer:</Text>
                        <Text>{store.user?.username || 'Unbekannt'}</Text>
                    </div>
                    <div className={styles.userInfo}>
                        <Text strong>E-Mail:</Text>
                        <Text>{store.user?.email || 'Nicht verfügbar'}</Text>
                    </div>
                    <div className={styles.userInfo}>
                        <Text strong>Benutzer-ID:</Text>
                        <Text>{store.user?.id || 'Unbekannt'}</Text>
                    </div>
                    <div className={styles.userInfo}>
                        <Text strong>Admin-Status:</Text>
                        <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>✓ Administrator</Text>
                    </div>
                </Space>
            </Card>

            {/* Debug Settings */}
            <AdminSettings
                isAdmin={isAdmin}
                debugPanelEnabled={debugPanelEnabled}
                onDebugPanelToggle={handleDebugPanelToggle}
            />

            {/* System Information */}
            <Card title="System-Information" className={styles.systemCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.systemInfo}>
                        <Text strong>Entwicklungsmodus:</Text>
                        <Text>{process.env.NODE_ENV === 'development' ? 'Aktiv' : 'Inaktiv'}</Text>
                    </div>
                    <div className={styles.systemInfo}>
                        <Text strong>React Version:</Text>
                        <Text>{React.version}</Text>
                    </div>
                    <div className={styles.systemInfo}>
                        <Text strong>Browser:</Text>
                        <Text>{navigator.userAgent.split(') ')[0].split('(')[1] || 'Unbekannt'}</Text>
                    </div>
                    <div className={styles.systemInfo}>
                        <Text strong>Bildschirmauflösung:</Text>
                        <Text>{window.innerWidth} x {window.innerHeight}</Text>
                    </div>
                </Space>
            </Card>

            {/* Admin Tools */}
            <Card title="Administrator-Tools" className={styles.toolsCard}>
                <Alert
                    message="Entwickler-Tools"
                    description="Nutzen Sie die Browser-Konsole für erweiterte Admin-Funktionen: adminUtils.checkCurrentUserStatus(), adminUtils.enableDebugPanel(), etc."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />

                <Space wrap>
                    <Button
                        type="primary"
                        icon={<BugOutlined />}
                        onClick={() => {
                            handleDebugPanelToggle(true);
                            window.location.reload();
                        }}
                        disabled={debugPanelEnabled}
                    >
                        Debug Panel aktivieren
                    </Button>

                    <Button
                        onClick={() => {
                            handleDebugPanelToggle(false);
                            window.location.reload();
                        }}
                        disabled={!debugPanelEnabled}
                    >
                        Debug Panel deaktivieren
                    </Button>

                    <Button
                        type="default"
                        icon={<ExperimentOutlined />}
                        onClick={goToDeveloperTesting}
                        style={{
                            background: '#f0f8ff',
                            borderColor: '#1890ff',
                            color: '#1890ff'
                        }}
                    >
                        Developer Testing Panel
                    </Button>

                    <Button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        danger
                    >
                        LocalStorage zurücksetzen
                    </Button>
                </Space>
            </Card>

            {/* Info Modal */}
            <Modal
                title="Administrator-Panel Information"
                open={modalVisible}
                onOk={() => setModalVisible(false)}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setModalVisible(false)}>
                        Verstanden
                    </Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph>
                        <strong>Willkommen im Administrator-Panel!</strong>
                    </Paragraph>
                    <Paragraph>
                        Dieses Panel bietet Ihnen erweiterte Funktionen zur Verwaltung und Überwachung der Anwendung:
                    </Paragraph>
                    <ul>
                        <li><strong>Debug Panel:</strong> Überwachen Sie API-Requests und Fehler in Echtzeit</li>
                        <li><strong>System-Info:</strong> Einsicht in wichtige Systemdaten</li>
                        <li><strong>Developer Tools:</strong> Zugriff auf erweiterte Debugging-Funktionen</li>
                        <li><strong>Settings Management:</strong> Kontrolle über Debug-Funktionen</li>
                    </ul>
                    <Alert
                        message="Hinweis"
                        description="Administrator-Funktionen sind nur für autorisierte Benutzer verfügbar und sollten mit Vorsicht verwendet werden."
                        type="warning"
                        showIcon
                    />
                </Space>
            </Modal>
        </div>
    );
}
