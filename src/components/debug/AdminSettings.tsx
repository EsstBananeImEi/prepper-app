import React, { useState, useEffect } from 'react';
import { Card, Switch, Divider, Typography, Space, Alert } from 'antd';
import { BugOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './AdminSettings.module.css';

const { Title, Text } = Typography;

interface Props {
    isAdmin: boolean;
    debugPanelEnabled: boolean;
    onDebugPanelToggle: (enabled: boolean) => void;
}

export default function AdminSettings({ isAdmin, debugPanelEnabled, onDebugPanelToggle }: Props) {
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
                Admin-Einstellungen
            </Space>
        } className={styles.adminCard}>
            <Alert
                message="Administrator-Bereich"
                description="Diese Einstellungen sind nur für Administratoren sichtbar."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                    <Text strong>
                        <BugOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                        API Debug Panel
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Zeigt einen draggbaren Debug-Button für API-Überwachung an
                    </Text>
                </div>
                <Switch
                    checked={localDebugEnabled}
                    onChange={handleDebugToggle}
                    checkedChildren="AN"
                    unCheckedChildren="AUS"
                />
            </div>

            <Divider />

            <div className={styles.debugInfo}>
                <Title level={5}>Debug-Funktionen:</Title>
                <ul className={styles.featureList}>
                    <li>API-Request-Monitoring</li>
                    <li>Error-Tracking und Analyse</li>
                    <li>Performance-Metriken</li>
                    <li>Draggbarer Button (über unterer Navigation auf Mobile)</li>
                    <li>Exportierbare Logs</li>
                </ul>

                {localDebugEnabled && (
                    <Alert
                        message="Debug Panel aktiv"
                        description="Der draggbare Debug-Button ist jetzt verfügbar. Klicken Sie darauf, um das Debug Panel zu öffnen."
                        type="success"
                        showIcon
                        style={{ marginTop: 12 }}
                    />
                )}
            </div>
        </Card>
    );
}
