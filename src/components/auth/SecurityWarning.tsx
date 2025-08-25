import React, { useEffect, useState } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { WarningOutlined, BugOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SecurityWarningProps {
    onDismiss?: () => void;
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has manipulated localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                // Check for suspicious admin status without proper token validation
                if (user.isAdmin === true && !user.access_token) {
                    setIsVisible(true);
                }
            } catch (error) {
                // Ignore parsing errors
            }
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Alert
            message="⚠️ Sicherheitshinweis für Entwickler"
            description={
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>
                        <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        <strong>Admin-Berechtigung wird jetzt server-seitig validiert!</strong>
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        Das manuelle Setzen von <code>user.isAdmin = true</code> in localStorage
                        funktioniert nicht mehr. Alle Admin-Bereiche werden durch JWT-Token
                        und Backend-Validierung geschützt.
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        <BugOutlined style={{ marginRight: 4 }} />
                        Für Development-Zwecke: Verwenden Sie die Backend-API um Admin-Status zu setzen.
                    </Text>
                </Space>
            }
            type="warning"
            showIcon
            closable
            onClose={handleDismiss}
            style={{ margin: '16px 0' }}
        />
    );
};

export default SecurityWarning;
