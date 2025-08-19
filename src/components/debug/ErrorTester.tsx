import React, { useState } from 'react';
import { Button, Space, Card, Typography, Alert, Divider } from 'antd';
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
        // Echter Network Error - wird NICHT von ErrorBoundary abgefangen
        fetch('https://nonexistent-domain-12345.com/api/test')
            .then(response => response.json())
            .catch(error => {
                console.error('Network Error (nicht von ErrorBoundary abgefangen):', error);
                // Zusätzlich in localStorage loggen für Demonstration
                const networkErrorLog = {
                    timestamp: new Date().toISOString(),
                    type: 'NetworkError (nicht abgefangen)',
                    message: error.message,
                    url: window.location.href
                };

                try {
                    const existingLogs = JSON.parse(localStorage.getItem('manual_error_logs') || '[]');
                    existingLogs.push(networkErrorLog);
                    localStorage.setItem('manual_error_logs', JSON.stringify(existingLogs.slice(-20)));
                } catch (e) {
                    console.error('Failed to log network error:', e);
                }
            });
    };

    const triggerAsyncError = () => {
        // Async Error - wird NICHT von ErrorBoundary abgefangen
        setTimeout(() => {
            console.error('Async Error (nicht von ErrorBoundary abgefangen): Dieser Fehler tritt nach 1 Sekunde auf');

            // Demonstriere einen echten async error
            try {
                const obj: { someProperty: { nestedProperty: string } } | null = null;
                console.log(obj!.someProperty.nestedProperty);
            } catch (error) {
                console.error('Async TypeError:', error);

                // In localStorage loggen
                const asyncErrorLog = {
                    timestamp: new Date().toISOString(),
                    type: 'AsyncError (nicht abgefangen)',
                    message: error instanceof Error ? error.message : String(error),
                    url: window.location.href
                };

                try {
                    const existingLogs = JSON.parse(localStorage.getItem('manual_error_logs') || '[]');
                    existingLogs.push(asyncErrorLog);
                    localStorage.setItem('manual_error_logs', JSON.stringify(existingLogs.slice(-20)));
                } catch (e) {
                    console.error('Failed to log async error:', e);
                }
            }
        }, 1000);
    };

    const triggerEventHandlerError = () => {
        try {
            // Event Handler Error - wird NICHT von ErrorBoundary abgefangen
            const obj: { someProperty: { nestedProperty: string } } | null = null;
            console.log(obj!.someProperty.nestedProperty);
        } catch (error) {
            console.error('Event Handler Error (nicht von ErrorBoundary abgefangen):', error);

            // In localStorage loggen
            const eventErrorLog = {
                timestamp: new Date().toISOString(),
                type: 'EventHandlerError (nicht abgefangen)',
                message: error instanceof Error ? error.message : String(error),
                url: window.location.href
            };

            try {
                const existingLogs = JSON.parse(localStorage.getItem('manual_error_logs') || '[]');
                existingLogs.push(eventErrorLog);
                localStorage.setItem('manual_error_logs', JSON.stringify(existingLogs.slice(-20)));
            } catch (e) {
                console.error('Failed to log event handler error:', e);
            }
        }
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
                    🧪 ErrorBoundary Tester
                </div>
            }
            style={{ maxWidth: 600, margin: '20px auto' }}
        >
            <Alert
                message="ℹ️ Test-Kategorien"
                description={
                    <div>
                        <p><strong>🟢 Wird von ErrorBoundary abgefangen:</strong> Render-Cycle Fehler</p>
                        <p><strong>🔴 Wird NICHT abgefangen:</strong> Async-Fehler, Event-Handler, Network-Requests</p>
                        <p><strong>📝 Alle Tests werden geloggt:</strong> Prüfen Sie die Browser-Konsole</p>
                    </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Buttons die ErrorBoundary auslösen */}
                <div>
                    <Text strong style={{ color: '#52c41a' }}>🟢 Wird von ErrorBoundary abgefangen:</Text>

                    <Button
                        type="primary"
                        danger
                        onClick={() => setShouldThrow(true)}
                        block
                        style={{ marginTop: 8 }}
                    >
                        🚨 Standard React Error
                    </Button>

                    <Button
                        type="default"
                        danger
                        onClick={triggerTypeError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        💥 TypeError auslösen
                    </Button>

                    <Button
                        type="default"
                        danger
                        onClick={triggerReferenceError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        🔍 ReferenceError auslösen
                    </Button>

                    <Button
                        type="default"
                        danger
                        onClick={triggerNetworkError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        🌐 Network Error simulieren
                    </Button>
                </div>

                <Divider />

                {/* Buttons die NICHT abgefangen werden */}
                <div>
                    <Text strong style={{ color: '#ff4d4f' }}>🔴 Wird NICHT von ErrorBoundary abgefangen:</Text>

                    <Button
                        type="dashed"
                        onClick={triggerRealNetworkError}
                        block
                        style={{ marginTop: 8 }}
                    >
                        🌐 Echter Network Error
                    </Button>

                    <Button
                        type="dashed"
                        onClick={triggerAsyncError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        ⏰ Async Error
                    </Button>

                    <Button
                        type="dashed"
                        onClick={triggerEventHandlerError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        🖱️ Event Handler Error
                    </Button>
                </div>

                <Divider />

                {/* Informations-Sektion für manuelle Fehler-Logs */}
                <Card size="small" title="🔍 Manuelle Error Logs Inspector">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Diese Tests werden in separaten Logs gespeichert (nicht-abgefangene Fehler):
                        </Text>
                        <div style={{
                            background: '#f5f5f5',
                            padding: '8px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            overflow: 'auto',
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap'
                        }}>
                            <div style={{ color: '#666' }}>{`// Manuelle Error-Logs anzeigen:`}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                console.log(JSON.parse(localStorage.getItem(&apos;manual_error_logs&apos;) || &apos;[]&apos;));
                            </div>
                            <br />
                            <div style={{ color: '#666' }}>{`// Manuelle Logs löschen:`}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                localStorage.removeItem(&apos;manual_error_logs&apos;);
                            </div>
                        </div>
                    </Space>
                </Card>

                <Button
                    type="default"
                    onClick={closeErrorOverlay}
                    block
                    style={{ marginTop: 8 }}
                >
                    ❌ React Error Overlay schließen
                </Button>

                {/* Hilfreiche Hinweise */}
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
