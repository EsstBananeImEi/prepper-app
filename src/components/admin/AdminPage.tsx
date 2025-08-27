import React, { useState } from 'react';
import { Card, Typography, Space, Alert, Divider, Button, Modal, Spin } from 'antd';
import { SettingOutlined, BugOutlined, UserOutlined, InfoCircleOutlined, ExperimentOutlined, LockOutlined } from '@ant-design/icons';
import { useStore } from '../../store/Store';
import { useNavigate } from 'react-router-dom';
import AdminSettings from '../debug/AdminSettings';
import SecurityWarning from '../auth/SecurityWarning';
import { useAdminValidation } from '../../hooks/useAdminValidation';
import styles from './AdminPage.module.css';
import { useTranslation } from 'react-i18next';
import { homeRoute, devTestingRoute } from '../../shared/Constants';

const { Title, Text, Paragraph } = Typography;

export default function AdminPage() {
    const { t } = useTranslation();
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
        navigate(devTestingRoute);
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
                    <Alert
                        message={t('admin.accessDenied.title')}
                        description={
                            <div>
                                <p>
                                    <LockOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                    {t('admin.accessDenied.body')}
                                </p>
                                <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                                    <strong>{t('admin.accessDenied.securityDetailsTitle')}</strong><br />
                                    • {t('admin.accessDenied.serverValidated')}<br />
                                    • {t('admin.accessDenied.noClientBypass')}<br />
                                    • {error || t('admin.accessDenied.unknownError')}
                                </p>
                            </div>
                        }
                        type="error"
                        showIcon
                        icon={<UserOutlined />}
                    />
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <Button type="primary" onClick={() => navigate(homeRoute)}>
                            {t('admin.backToHome')}
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
                                {t('admin.title')}
                            </Title>
                            <Text type="secondary">
                                {t('admin.subtitle')}
                            </Text>
                        </div>
                        <Button
                            type="primary"
                            icon={<InfoCircleOutlined />}
                            onClick={showAdminInfo}
                            className={styles.infoButton}
                        >
                            {t('admin.info')}
                        </Button>
                    </div>
                </Space>
            </Card>

            {/* Current User Info */}
            <Card title={t('admin.userInfo.title')} className={styles.userInfoCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.userInfo}>
                        <Text strong>{t('admin.userInfo.currentUser')}</Text>
                        <Text>{store.user?.username || t('admin.userInfo.unknown')}</Text>
                    </div>
                    <div className={styles.userInfo}>
                        <Text strong>{t('admin.userInfo.email')}</Text>
                        <Text>{store.user?.email || t('admin.userInfo.notAvailable')}</Text>
                    </div>
                    <div className={styles.userInfo}>
                        <Text strong>{t('admin.userInfo.userId')}</Text>
                        <Text>{store.user?.id || t('admin.userInfo.unknown')}</Text>
                    </div>
                    <div className={styles.userInfo}>
                        <Text strong>{t('admin.userInfo.adminStatus')}</Text>
                        <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{t('admin.userInfo.adminYes')}</Text>
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
            <Card title={t('admin.system.title')} className={styles.systemCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className={styles.systemInfo}>
                        <Text strong>{t('admin.system.devMode')}</Text>
                        <Text>{process.env.NODE_ENV === 'development' ? t('admin.system.devActive') : t('admin.system.devInactive')}</Text>
                    </div>
                    <div className={styles.systemInfo}>
                        <Text strong>{t('admin.system.reactVersion')}</Text>
                        <Text>{React.version}</Text>
                    </div>
                    <div className={styles.systemInfo}>
                        <Text strong>{t('admin.system.browser')}</Text>
                        <Text>{navigator.userAgent.split(') ')[0].split('(')[1] || 'Unbekannt'}</Text>
                    </div>
                    <div className={styles.systemInfo}>
                        <Text strong>{t('admin.system.resolution')}</Text>
                        <Text>{window.innerWidth} x {window.innerHeight}</Text>
                    </div>
                </Space>
            </Card>

            {/* Admin Tools */}
            <Card title={t('admin.tools.title')} className={styles.toolsCard}>
                <Alert
                    message={t('admin.tools.devToolsTitle')}
                    description={t('admin.tools.devToolsDesc')}
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
                        {t('admin.tools.enableDebugPanel')}
                    </Button>

                    <Button
                        onClick={() => {
                            handleDebugPanelToggle(false);
                            window.location.reload();
                        }}
                        disabled={!debugPanelEnabled}
                    >
                        {t('admin.tools.disableDebugPanel')}
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
                        {t('admin.tools.devTestingPanel')}
                    </Button>

                    <Button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        danger
                    >
                        {t('admin.tools.clearLocalStorage')}
                    </Button>
                </Space>
            </Card>

            {/* Info Modal */}
            <Modal
                title={t('admin.modal.title')}
                open={modalVisible}
                onOk={() => setModalVisible(false)}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setModalVisible(false)}>
                        {t('admin.modal.ok')}
                    </Button>
                ]}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Paragraph>
                        <strong>{t('admin.modal.welcome')}</strong>
                    </Paragraph>
                    <Paragraph>
                        {t('admin.modal.intro')}
                    </Paragraph>
                    <ul>
                        <li><strong>Debug Panel:</strong> {t('admin.modal.bullets.debug')}</li>
                        <li><strong>System-Info:</strong> {t('admin.modal.bullets.system')}</li>
                        <li><strong>Developer Tools:</strong> {t('admin.modal.bullets.devtools')}</li>
                        <li><strong>Settings Management:</strong> {t('admin.modal.bullets.settings')}</li>
                    </ul>
                    <Alert
                        message={t('admin.modal.noteTitle')}
                        description={t('admin.modal.noteDesc')}
                        type="warning"
                        showIcon
                    />
                </Space>
            </Modal>
        </div>
    );
}
