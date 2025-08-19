import React, { useState } from 'react';
import { Button, Space, Card, Typography } from 'antd';
import { BugOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ErrorTester: React.FC = () => {
    const [shouldThrow, setShouldThrow] = useState(false);
    const [triggerType, setTriggerType] = useState<string | null>(null);

    if (shouldThrow) {
        // Dieser Fehler wird von der ErrorBoundary abgefangen
        throw new Error('Test Error - ErrorBoundary funktioniert!');
    }

    if (triggerType === 'typeError') {
        // TypeError im Render-Zyklus - wird von ErrorBoundary abgefangen
        const obj: null = null;
        console.log((obj as unknown as { someProperty: { nestedProperty: string } }).someProperty.nestedProperty);
    }

    if (triggerType === 'referenceError') {
        // ReferenceError im Render-Zyklus - wird von ErrorBoundary abgefangen
        // @ts-expect-error - Bewusster ReferenceError für Testing
        console.log(nonExistentVariable);
    }

    if (triggerType === 'networkError') {
        // Network Error im Render-Zyklus simulieren - wird von ErrorBoundary abgefangen
        throw new Error('Network Error: Failed to fetch from nonexistent-domain-12345.com');
    }

    const triggerTypeError = () => {
        // TypeError im Render auslösen
        setTriggerType('typeError');
    };

    const triggerReferenceError = () => {
        // ReferenceError im Render auslösen
        setTriggerType('referenceError');
    };

    const triggerNetworkError = () => {
        // Network Error im Render auslösen
        setTriggerType('networkError');
    };

    const triggerRealNetworkError = () => {
        // Echter Netzwerk-Fehler - wird NICHT von ErrorBoundary abgefangen
        fetch('http://nonexistent-domain-12345.com/api')
            .catch(error => {
                console.error('Network Error (nicht abgefangen):', error);
                throw new Error('Network Error: ' + error.message);
            });
    };

    const triggerAsyncError = async () => {
        // Async Fehler
        setTimeout(() => {
            throw new Error('Async Error - sollte nicht von ErrorBoundary abgefangen werden');
        }, 1000);
    };

    const triggerEventHandlerError = () => {
        // Event Handler Fehler - wird NICHT von ErrorBoundary abgefangen
        const obj: null = null;
        console.log((obj as unknown as { someProperty: { nestedProperty: string } }).someProperty.nestedProperty);
    };

    const closeErrorOverlay = () => {
        // React Development Error Overlay schließen
        const iframe = document.querySelector('iframe[src*="data:text/html"]');
        if (iframe) {
            iframe.remove();
        }
        // Alternative: Event zum Schließen senden
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    };

    return (
        <Card
            title={
                <div>
                    <BugOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                    ErrorBoundary Tester
                </div>
            }
            style={{ maxWidth: 600, margin: '20px auto' }}
        >
            <div style={{ marginBottom: 16 }}>
                <Title level={4}>Verschiedene Fehler-Typen testen:</Title>
                <Text type="secondary">
                    ErrorBoundaries fangen nur <strong>Render-Fehler</strong> ab, nicht Event-Handler oder asynchrone Fehler.
                </Text>
            </div>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                    type="primary"
                    danger
                    onClick={() => setShouldThrow(true)}
                    block
                >
                    🚨 Standard React Error
                </Button>

                <Button
                    type="default"
                    danger
                    onClick={triggerTypeError}
                    block
                >
                    💥 TypeError auslösen
                </Button>

                <Button
                    type="default"
                    danger
                    onClick={triggerReferenceError}
                    block
                >
                    🔍 ReferenceError auslösen
                </Button>

                <Button
                    type="default"
                    danger
                    onClick={triggerNetworkError}
                    block
                >
                    🌐 Network Error simulieren
                </Button>

                <Button
                    type="dashed"
                    onClick={triggerRealNetworkError}
                    block
                >
                    🌐 Echter Network Error
                </Button>

                <Button
                    type="dashed"
                    onClick={triggerAsyncError}
                    block
                >
                    ⏰ Async Error
                </Button>

                <Button
                    type="dashed"
                    onClick={triggerEventHandlerError}
                    block
                >
                    🖱️ Event Handler Error
                </Button>

                <Button
                    type="default"
                    onClick={closeErrorOverlay}
                    block
                    style={{ marginTop: 8 }}
                >
                    ❌ React Error Overlay schließen
                </Button>

                <div style={{
                    padding: 12,
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 6
                }}>
                    <Text style={{ fontSize: '12px', color: '#389e0d' }}>
                        💡 <strong>Tipp:</strong> Öffnen Sie die Browser-Konsole, um die Error-Logs zu sehen.
                        In Production werden kritische Fehler per Email gesendet.
                    </Text>
                </div>

                <div style={{
                    padding: 12,
                    background: '#fff2e8',
                    border: '1px solid #ffbb96',
                    borderRadius: 6
                }}>
                    <Text style={{ fontSize: '12px', color: '#d46b08' }}>
                        ⚠️ <strong>Development Mode:</strong> Das React Error Overlay kann die ErrorBoundary überdecken.
                        Klicken Sie das &quot;X&quot; oben rechts im roten Error Overlay weg, um die ErrorBoundary zu sehen.
                    </Text>
                </div>
            </Space>
        </Card>
    );
};

export default ErrorTester;
