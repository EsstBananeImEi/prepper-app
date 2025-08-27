// src/components/ResetSuccess.tsx
import React, { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { loginRoute } from '../../../shared/Constants';

export default function ResetSuccessForm(): ReactElement {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Lese die Query-Parameter
    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get('message') || t('auth.resetSuccess.defaultMessage');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f4f4f4'
        }}>
            <h1 style={{ color: '#2F3C7E' }}>{t('auth.resetSuccess.title')}</h1>
            <Alert
                message={message}
                type="success"
                showIcon
                style={{ margin: '20px 0', width: '100%', maxWidth: '400px' }}
            />
            <Button type="primary" onClick={() => navigate(loginRoute)}>
                {t('auth.resetSuccess.toLogin')}
            </Button>
        </div>
    );
}
