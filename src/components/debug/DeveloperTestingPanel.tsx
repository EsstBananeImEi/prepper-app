import React from 'react';
import { Card, Typography, Space, Alert, Button, Divider, Spin } from 'antd';
import { Switch, message } from 'antd';
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
import { useTranslation } from 'react-i18next';
import { adminRoute, homeRoute } from '../../shared/Constants';
import logger from '../../utils/logger';
import acc from '../../styles/accessibility.module.css';

const { Title, Text, Paragraph } = Typography;

const DeveloperTestingPanel: React.FC = () => {
    const navigate = useNavigate();
    const { store } = useStore();
    const { t } = useTranslation();

    // Secure admin validation using server-side check
    const { isAdmin, isValidating, error } = useAdminValidation();

    const goToHome = () => {
        navigate(homeRoute);
    };

    const goToAdmin = () => {
        navigate(adminRoute);
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
                            {t('admin.validating')}
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
                            message={t('admin.devPanel.accessDeniedTitle')}
                            description={
                                <div>
                                    <p>
                                        <LockOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                        {t('admin.accessDenied.body')}
                                    </p>
                                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                                        <strong>{t('admin.accessDenied.securityDetailsTitle')}</strong><br />
                                        • {t('admin.accessDenied.serverValidated')}<br />
                                        • {t('admin.devPanel.testingToolsOnly')}<br />
                                        • {error || t('admin.accessDenied.unknownError')}
                                    </p>
                                </div>
                            }
                            type="error"
                            showIcon
                            icon={<UserOutlined />}
                        />
                        <Space>
                            <Button type="primary" icon={<HomeOutlined />} onClick={goToHome}>
                                {t('admin.backToHome')}
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
                                {t('admin.devPanel.title')}
                            </Title>
                            <Paragraph type="secondary">
                                {t('admin.devPanel.subtitle')}
                            </Paragraph>
                        </div>
                        <Space className={styles.navigationButtons}>
                            <Button
                                icon={<ToolOutlined />}
                                onClick={goToAdmin}
                                className={styles.navigationButton}
                            >
                                {t('navbar.adminPanel')}
                            </Button>
                            <Button
                                type="primary"
                                icon={<HomeOutlined />}
                                onClick={goToHome}
                                className={styles.navigationButton}
                            >
                                {t('common.home')}
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Card>

            {/* Info Alert */}
            <Alert
                message={t('admin.devPanel.info.title')}
                description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text>
                            {t('admin.devPanel.info.desc')}
                        </Text>
                        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                            <li>{t('admin.devPanel.info.bullets.errorBoundary')}</li>
                            <li>{t('admin.devPanel.info.bullets.errorLogging')}</li>
                            <li>{t('admin.devPanel.info.bullets.emailNotifications')}</li>
                            <li>{t('admin.devPanel.info.bullets.recovery')}</li>
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
                        {t('admin.devPanel.env.title')}
                    </div>
                }
                className={styles.environmentCard}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.environmentInfo}>
                        <Text strong>{t('admin.devPanel.env.fields.mode')}</Text>
                        <Text code>{process.env.NODE_ENV || 'development'}</Text>
                    </div>
                    <div className={styles.environmentInfo}>
                        <Text strong>{t('admin.devPanel.env.fields.apiUrl')}</Text>
                        <Text code>{process.env.REACT_APP_API_URL || 'http://localhost:4000'}</Text>
                    </div>
                    <div className={styles.environmentInfo}>
                        <Text strong>{t('admin.devPanel.env.fields.errorNotifications')}</Text>
                        <Text code>
                            {process.env.NODE_ENV === 'production' ? t('admin.devPanel.env.values.enabled') : t('admin.devPanel.env.values.criticalOnly')}
                        </Text>
                    </div>
                    <div className={styles.environmentInfo}>
                        <Text strong>{t('admin.devPanel.env.fields.user')}</Text>
                        <Text>{store.user?.username} (Admin)</Text>
                    </div>
                </Space>
            </Card>

            {/* ErrorBoundary Testing */}
            <Card
                title={
                    <div>
                        <BugOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                        {t('admin.devPanel.testing.title')}
                    </div>
                }
                className={styles.testingCard}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                        message={t('admin.devPanel.testing.warningTitle')}
                        description={t('admin.devPanel.testing.warningDesc')}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {/* ErrorTester Component */}
                    <ErrorTester />

                    {/* localStorage Inspector */}
                    <Card
                        size="small"
                        title={t('admin.devPanel.logs.title')}
                        style={{ marginTop: 16 }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                {t('admin.devPanel.logs.instructions')}
                            </Text>

                            {/* ErrorBoundary Logs */}
                            <div>
                                <Text strong>📊 ErrorBoundary-Logs (abgefangene Fehler):</Text>
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeComment}>{`// Alle ErrorBoundary-Logs anzeigen:`}</div>
                                    <div className={styles.codeCommand}>logger.log(JSON.parse(localStorage.getItem(&apos;error_logs&apos;) || &apos;[]&apos;));</div>
                                    <br />
                                    <div className={styles.codeComment}>{`// Nur failed uploads anzeigen:`}</div>
                                    <div className={styles.codeCommand}>
                                        const logs = JSON.parse(localStorage.getItem(&apos;error_logs&apos;) || &apos;[]&apos;));<br />
                                        logger.log(&apos;Failed uploads:&apos;, logs.filter(log =&gt; log.failedServerUpload));
                                    </div>
                                    <br />
                                    <div className={styles.codeComment}>{`// ErrorBoundary-Logs löschen:`}</div>
                                    <div className={styles.codeCommand}>localStorage.removeItem(&apos;error_logs&apos;);</div>
                                </div>
                            </div>

                            <Divider />

                            {/* Scanner Debug Controls */}
                            <div>
                                <Text strong>🔧 Scanner Debug</Text>
                                <div style={{ marginTop: 8, marginBottom: 8 }}>
                                    <Space align="center">
                                        <Text type="secondary">Enable scanner debug logs (local only)</Text>
                                        <Switch
                                            checked={localStorage.getItem('admin_debug_enabled') === '1'}
                                            onChange={(v) => {
                                                try {
                                                    if (v) localStorage.setItem('admin_debug_enabled', '1'); else localStorage.removeItem('admin_debug_enabled');
                                                    message.success('Scanner debug ' + (v ? 'enabled' : 'disabled'));
                                                    // trigger a reload so components pick up change where necessary
                                                    // do not force full reload; instruct user to re-open scanner if needed
                                                } catch (e) {
                                                    message.error('Could not update localStorage');
                                                }
                                            }}
                                        />
                                    </Space>
                                </div>
                                <Space>
                                    <Button onClick={() => {
                                        try {
                                            const logs = JSON.parse(localStorage.getItem('scanner_debug_logs') || '[]');
                                            console.log('scanner_debug_logs', logs);
                                            message.info('Scanner logs printed to console');
                                        } catch (e) {
                                            message.error('No scanner logs found');
                                        }
                                    }}>Print scanner logs</Button>
                                    <Button onClick={() => { localStorage.removeItem('scanner_debug_logs'); message.success('Scanner logs cleared'); }}>Clear scanner logs</Button>
                                </Space>
                            </div>

                            {/* Manuelle Logs */}
                            <div>
                                <Text strong>📋 Manuelle Logs (nicht-abgefangene Fehler):</Text>
                                <div className={styles.codeBlock}>
                                    <div className={styles.codeComment}>{`// Manuelle Error-Logs anzeigen:`}</div>
                                    <div className={styles.codeCommand}>logger.log(JSON.parse(localStorage.getItem(&apos;manual_error_logs&apos;) || &apos;[]&apos;));</div>
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
