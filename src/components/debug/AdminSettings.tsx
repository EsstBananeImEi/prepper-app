import React, { useState, useEffect } from 'react';
import { Card, Switch, Divider, Typography, Space, Alert } from 'antd';
import { BugOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './AdminSettings.module.css';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface Props {
    isAdmin: boolean;
    debugPanelEnabled: boolean;
    onDebugPanelToggle: (enabled: boolean) => void;
}

export default function AdminSettings({ isAdmin, debugPanelEnabled, onDebugPanelToggle }: Props) {
    const { t } = useTranslation();
    const [localDebugEnabled, setLocalDebugEnabled] = useState(debugPanelEnabled);

    useEffect(() => {
        setLocalDebugEnabled(debugPanelEnabled);
    }, [debugPanelEnabled]);

    const handleDebugToggle = (checked: boolean) => {
        setLocalDebugEnabled(checked);
        onDebugPanelToggle(checked);

        // Save to localStorage for persistence
        localStorage.setItem('debugPanelEnabled', checked.toString());
    };

    if (!isAdmin) {
        return null; // Don't show admin settings for non-admin users
    }

    return (
        <Card title={
            <Space>
                <SettingOutlined />
                {t('admin.settings.title')}
            </Space>
        } className={styles.adminCard}>
            <Alert
                message={t('admin.settings.adminAreaTitle')}
                description={t('admin.settings.adminAreaDesc')}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                    <Text strong>
                        <BugOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        {t('admin.settings.apiDebugPanel')}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {t('admin.settings.apiDebugPanelDesc')}
                    </Text>
                </div>
                <Switch
                    checked={localDebugEnabled}
                    onChange={handleDebugToggle}
                    checkedChildren={t('admin.settings.switchOn')}
                    unCheckedChildren={t('admin.settings.switchOff')}
                />
            </div>

            <Divider />

            <div className={styles.debugInfo}>
                <Title level={5}>{t('admin.settings.debugFunctionsTitle')}</Title>
                <ul className={styles.featureList}>
                    <li>{t('admin.settings.features.monitoring')}</li>
                    <li>{t('admin.settings.features.errorTracking')}</li>
                    <li>{t('admin.settings.features.performance')}</li>
                    <li>{t('admin.settings.features.draggable')}</li>
                    <li>{t('admin.settings.features.exportable')}</li>
                </ul>

                {localDebugEnabled && (
                    <Alert
                        message={t('admin.settings.panelActiveTitle')}
                        description={t('admin.settings.panelActiveDesc')}
                        type="success"
                        showIcon
                        style={{ marginTop: 12 }}
                    />
                )}
            </div>
        </Card>
    );
}
