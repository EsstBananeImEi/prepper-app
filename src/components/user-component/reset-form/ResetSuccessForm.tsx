// src/components/ResetSuccess.tsx
import React, { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button } from 'antd';

export default function ResetSuccessForm(): ReactElement {
    const location = useLocation();
    const navigate = useNavigate();

    // Lese die Query-Parameter
    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get('message') || 'Passwort erfolgreich zurückgesetzt.';

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
            <h1 style={{ color: '#2F3C7E' }}>Passwort zurückgesetzt</h1>
            <Alert
                message={message}
                type="success"
                showIcon
                style={{ margin: '20px 0', width: '100%', maxWidth: '400px' }}
            />
            <Button type="primary" onClick={() => navigate('/login')}>
                Zum Login
            </Button>
        </div>
    );
}
