import React from 'react';
import { Card, Typography, Space, Alert, Button, Divider, Spin } from 'antd';
import {
    BugOutlined,
    ExperimentOutlined,
    CodeOutlined,
    ToolOutlined,
    HomeOutlined,
    LockOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ErrorTester from '../debug/ErrorTester';
import { useStore } from '../../store/Store';
import { useAdminValidation } from '../../hooks/useAdminValidation';
import styles from './DeveloperTestingPanel.module.css';

const { Title, Text, Paragraph } = Typography;

const DeveloperTestingPanel: React.FC = () => {
    const navigate = useNavigate();
    const { store } = useStore();

    // Secure admin validation using server-side check
    const { isAdmin, isValidating, error } = useAdminValidation();

    const goToHome = () => {
        navigate('/');
    };

    const goToAdmin = () => {
        navigate('/admin');
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
                    <Space direction="vertical" size="large">
                        <Alert
                            message="Zugriff verweigert - Developer Testing Panel"
                            description={
                                <div>
                                    <p>
                                        <LockOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                        Sie haben keine Administrator-Berechtigung für diesen Entwicklerbereich.
                                    </p>
                                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                                        <strong>Sicherheitsdetails:</strong><br />
                                        • Admin-Status wird server-seitig validiert<br />
                                        • Testing-Tools sind nur für autorisierte Entwickler<br />
                                        • {error || 'Unbekannter Validierungsfehler'}
                                    </p>
                                </div>
                            }
                            type="error"
                            showIcon
                            icon={<UserOutlined />}
                        />
                        <Space>
                            <Button type="primary" icon={<HomeOutlined />} onClick={goToHome}>
                                Zur Startseite
                            </Button>
                        </Space>
                    </Space>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <Card className={styles.headerCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.headerContent}>
                        <div>
                            <Title level={2} className={styles.title}>
                                <ExperimentOutlined className={styles.titleIcon} />
                                Developer Testing Panel
                            </Title>
                            <Paragraph type="secondary">
                                Umfassende Test-Tools für Entwickler und System-Administratoren zur Überprüfung
                                der Fehlerbehandlung, Logging-Systeme und Anwendungsstabilität.
                            </Paragraph>
                        </div>
                        <Space className={styles.navigationButtons}>
                            <Button
                                icon={<ToolOutlined />}
                                onClick={goToAdmin}
                                className={styles.navigationButton}
                            >
                                Admin Panel
                            </Button>
                            <Button
                                type="primary"
                                icon={<HomeOutlined />}
                                onClick={goToHome}
                                className={styles.navigationButton}
                            >
                                Startseite
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Card>

            {/* Info Alert */}
            <Alert
                message="🔬 Entwickler-Testbereich"
                description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text>
                            Diese Tools sind speziell für das Testen und Validieren der Anwendungsstabilität entwickelt.
                        </Text>
                        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                            <li><strong>ErrorBoundary Testing:</strong> Testen Sie React Error Boundaries und Fehlerprotokollierung</li>
                            <li><strong>Error Logging:</strong> Überprüfen Sie localStorage und Server-Logging-Funktionen</li>
                            <li><strong>Email Notifications:</strong> Validieren Sie kritische Fehler-Benachrichtigungen</li>
                            <li><strong>Recovery Testing:</strong> Testen Sie Anwendungs-Recovery-Mechanismen</li>
                        </ul>
                    </Space>
                }
                type="info"
                showIcon
                className={styles.infoCard}
            />

            {/* Environment Info */}
            <Card
                title={
                    <div>
                        <CodeOutlined style={{ marginRight: 8 }} />
                        Umgebungs-Information
                    </div>
                }
                className={styles.environmentCard}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.environmentInfo}>
                        <Text strong>Modus:</Text>
                        <Text code>{process.env.NODE_ENV || 'development'}</Text>
                    </div>
                    <div className={styles.environmentInfo}>
                        <Text strong>API URL:</Text>
                        <Text code>{process.env.REACT_APP_API_URL || 'http://localhost:4000'}</Text>
                    </div>
                    <div className={styles.environmentInfo}>
                        <Text strong>Error Notifications:</Text>
                        <Text code>
                            {process.env.NODE_ENV === 'production' ? 'Aktiviert' : 'Nur bei kritischen Fehlern'}
                        </Text>
                    </div>
                    <div className={styles.environmentInfo}>
                        <Text strong>Benutzer:</Text>
                        <Text>{store.user?.username} (Admin)</Text>
                    </div>
                </Space>
            </Card>

            {/* ErrorBoundary Testing */}
            <Card
                title={
                    <div>
                        <BugOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                        ErrorBoundary & Fehler-Testing
                    </div>
                }
                className={styles.testingCard}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                        message="⚠️ Vorsicht beim Testen"
                        description="Diese Tests lösen echte Fehler aus. In Development wird das React Error Overlay angezeigt - klicken Sie das 'X' weg, um die ErrorBoundary-UI zu sehen. In Production sehen Benutzer nur die freundliche Fehlerseite."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {/* ErrorTester Component */}
                    <ErrorTester />

                    {/* localStorage Inspector */}
                    <Card
                        size="small"
                        title="🔍 Error Logs Inspector"
                        style={{ marginTop: 16 }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Führen Sie diese Befehle in der Browser-Konsole aus:
                            </Text>

                            {/* ErrorBoundary Logs */}
                            <div>
                                <Text strong>📊 ErrorBoundary-Logs (abgefangene Fehler):</Text>
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeComment}>{`// Alle ErrorBoundary-Logs anzeigen:`}</div>
                                    <div className={styles.codeCommand}>console.log(JSON.parse(localStorage.getItem(&apos;error_logs&apos;) || &apos;[]&apos;));</div>
                                    <br />
                                    <div className={styles.codeComment}>{`// Nur failed uploads anzeigen:`}</div>
                                    <div className={styles.codeCommand}>
                                        const logs = JSON.parse(localStorage.getItem(&apos;error_logs&apos;) || &apos;[]&apos;));<br />
                                        console.log(&apos;Failed uploads:&apos;, logs.filter(log =&gt; log.failedServerUpload));
                                    </div>
                                    <br />
                                    <div className={styles.codeComment}>{`// ErrorBoundary-Logs löschen:`}</div>
                                    <div className={styles.codeCommand}>localStorage.removeItem(&apos;error_logs&apos;);</div>
                                </div>
                            </div>

                            <Divider />

                            {/* Manuelle Logs */}
                            <div>
                                <Text strong>📋 Manuelle Logs (nicht-abgefangene Fehler):</Text>
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeComment}>{`// Manuelle Error-Logs anzeigen:`}</div>
                                    <div className={styles.codeCommand}>console.log(JSON.parse(localStorage.getItem(&apos;manual_error_logs&apos;) || &apos;[]&apos;));</div>
                                    <br />
                                    <div className={styles.codeComment}>{`// Manuelle Logs löschen:`}</div>
                                    <div className={styles.codeCommand}>localStorage.removeItem(&apos;manual_error_logs&apos;);</div>
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Space>
            </Card>
        </div>
    );
};

export default DeveloperTestingPanel;
