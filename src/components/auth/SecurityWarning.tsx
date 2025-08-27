import React, { useEffect, useState } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { WarningOutlined, BugOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface SecurityWarningProps {
    onDismiss?: () => void;
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({ onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useTranslation();

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
            message={t('auth.securityWarning.title')}
            description={
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>
                        <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                        <strong>{t('auth.securityWarning.adminValidated')}</strong>
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        {t('auth.securityWarning.note1')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        <BugOutlined style={{ marginRight: 4 }} />
                        {t('auth.securityWarning.note2')}
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
