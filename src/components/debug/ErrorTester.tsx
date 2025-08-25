import React, { useState } from 'react';
import { Button, Space, Card, Typography, Alert, Divider, message, notification } from 'antd';
import { BugOutlined, CheckCircleOutlined } from '@ant-design/icons';

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

    // ========== KORREKTE FEHLERBEHANDLUNG - LÖSUNGSANSÄTZE ==========

    const properNetworkErrorHandling = async () => {
        try {
            message.loading({ content: 'Network Request läuft...', key: 'network' });

            const response = await fetch('https://nonexistent-domain-12345.com/api/test');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            message.success({ content: 'Network Request erfolgreich!', key: 'network' });
        } catch (error) {
            // ✅ KORREKTE Behandlung von Network-Fehlern
            console.error('Network Error korrekt behandelt:', error);

            message.error({
                content: 'Netzwerk-Fehler: Bitte prüfen Sie Ihre Internetverbindung.',
                key: 'network',
                duration: 5
            });

            // Strukturiertes Error-Logging
            const properErrorLog = {
                timestamp: new Date().toISOString(),
                type: 'NetworkError (korrekt behandelt)',
                message: error instanceof Error ? error.message : String(error),
                url: window.location.href,
                userFriendlyMessage: 'Netzwerk-Fehler aufgetreten',
                handled: true
            };

            // In separates Log für korrekt behandelte Fehler
            try {
                const existingLogs = JSON.parse(localStorage.getItem('properly_handled_errors') || '[]');
                existingLogs.push(properErrorLog);
                localStorage.setItem('properly_handled_errors', JSON.stringify(existingLogs.slice(-20)));
            } catch (e) {
                console.error('Failed to log properly handled error:', e);
            }
        }
    };

    const properAsyncErrorHandling = () => {
        // ✅ KORREKTE Behandlung von Async-Fehlern mit Promise-Wrapper
        const asyncOperation = new Promise((resolve, reject) => {
            setTimeout(() => {
                const obj: { someProperty: { nestedProperty: string } } | null = null;
                try {
                    console.log(obj!.someProperty.nestedProperty);
                    resolve('Success');
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });

        message.loading({ content: 'Async Operation läuft...', key: 'async' });

        asyncOperation
            .then((result) => {
                message.success({ content: 'Async Operation erfolgreich!', key: 'async' });
            })
            .catch((error) => {
                // ✅ KORREKTE Promise-Fehlerbehandlung
                console.error('Async Error korrekt behandelt:', error);

                notification.warning({
                    message: 'Async Operation fehlgeschlagen',
                    description: 'Ein zeitversetzter Vorgang ist fehlgeschlagen. Der Fehler wurde geloggt.',
                    duration: 4,
                    placement: 'topRight'
                });

                message.error({
                    content: 'Async Operation fehlgeschlagen',
                    key: 'async'
                });

                // Strukturiertes Error-Logging
                const properAsyncLog = {
                    timestamp: new Date().toISOString(),
                    type: 'AsyncError (korrekt behandelt)',
                    message: error instanceof Error ? error.message : String(error),
                    url: window.location.href,
                    userFriendlyMessage: 'Zeitversetzter Vorgang fehlgeschlagen',
                    handled: true
                };

                try {
                    const existingLogs = JSON.parse(localStorage.getItem('properly_handled_errors') || '[]');
                    existingLogs.push(properAsyncLog);
                    localStorage.setItem('properly_handled_errors', JSON.stringify(existingLogs.slice(-20)));
                } catch (e) {
                    console.error('Failed to log properly handled async error:', e);
                }
            });
    };

    const properEventHandlerErrorHandling = () => {
        try {
            // ✅ KORREKTE Event-Handler Fehlerbehandlung mit try-catch
            const obj: { someProperty: { nestedProperty: string } } | null = null;
            console.log(obj!.someProperty.nestedProperty);
        } catch (error) {
            // ✅ KORREKTE Behandlung von Event-Handler-Fehlern
            console.error('Event Handler Error korrekt behandelt:', error);

            notification.error({
                message: 'Benutzer-Aktion fehlgeschlagen',
                description: 'Beim Verarbeiten Ihrer Aktion ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
                duration: 5,
                placement: 'topRight'
            });

            // Strukturiertes Error-Logging
            const properEventLog = {
                timestamp: new Date().toISOString(),
                type: 'EventHandlerError (korrekt behandelt)',
                message: error instanceof Error ? error.message : String(error),
                url: window.location.href,
                userAction: 'Button Click',
                userFriendlyMessage: 'Benutzer-Aktion fehlgeschlagen',
                handled: true
            };

            try {
                const existingLogs = JSON.parse(localStorage.getItem('properly_handled_errors') || '[]');
                existingLogs.push(properEventLog);
                localStorage.setItem('properly_handled_errors', JSON.stringify(existingLogs.slice(-20)));
            } catch (e) {
                console.error('Failed to log properly handled event error:', e);
            }
        }
    };

    const clearAllLogs = () => {
        localStorage.removeItem('manual_error_logs');
        localStorage.removeItem('properly_handled_errors');
        localStorage.removeItem('error_logs');
        message.success('Alle Error-Logs wurden gelöscht');
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

                {/* Buttons die RICHTIGE Fehlerbehandlung zeigen */}
                <div>
                    <Text strong style={{ color: '#1890ff' }}>✅ KORREKTE Fehlerbehandlung - Lösungsansätze:</Text>

                    <Button
                        type="primary"
                        onClick={properNetworkErrorHandling}
                        block
                        style={{ marginTop: 8, background: '#52c41a', borderColor: '#52c41a' }}
                        icon={<CheckCircleOutlined />}
                    >
                        ✅ Network Error richtig behandeln
                    </Button>

                    <Button
                        type="primary"
                        onClick={properAsyncErrorHandling}
                        block
                        style={{ marginTop: 4, background: '#52c41a', borderColor: '#52c41a' }}
                        icon={<CheckCircleOutlined />}
                    >
                        ✅ Async Error richtig behandeln
                    </Button>

                    <Button
                        type="primary"
                        onClick={properEventHandlerErrorHandling}
                        block
                        style={{ marginTop: 4, background: '#52c41a', borderColor: '#52c41a' }}
                        icon={<CheckCircleOutlined />}
                    >
                        ✅ Event Handler Error richtig behandeln
                    </Button>
                </div>

                <Divider />

                {/* Informations-Sektion für manuelle Fehler-Logs */}
                <Card size="small" title="🔍 Error Logs Inspector (Erweitert)">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Alert
                            message="📊 Drei verschiedene Log-Kategorien"
                            description={
                                <div style={{ fontSize: '11px' }}>
                                    <p><strong style={{ color: '#ff4d4f' }}>🔴 manual_error_logs:</strong> Nicht-abgefangene Fehler (problematisch)</p>
                                    <p><strong style={{ color: '#52c41a' }}>🟢 properly_handled_errors:</strong> Korrekt behandelte Fehler</p>
                                    <p><strong style={{ color: '#1890ff' }}>🔵 error_logs:</strong> ErrorBoundary-Logs (automatisch)</p>
                                </div>
                            }
                            type="info"
                            showIcon={false}
                            style={{ marginBottom: 12 }}
                        />

                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Console-Befehle für alle Log-Typen:
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
                            <div style={{ color: '#ff4d4f' }}>{`// 🔴 Problematische Fehler (nicht behandelt):`}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                console.log(JSON.parse(localStorage.getItem(&apos;manual_error_logs&apos;) || &apos;[]&apos;));
                            </div>
                            <br />

                            <div style={{ color: '#52c41a' }}>{`// ✅ Korrekt behandelte Fehler:`}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                console.log(JSON.parse(localStorage.getItem(&apos;properly_handled_errors&apos;) || &apos;[]&apos;));
                            </div>
                            <br />

                            <div style={{ color: '#1890ff' }}>{`// 🔵 ErrorBoundary-Logs:`}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                console.log(JSON.parse(localStorage.getItem(&apos;error_logs&apos;) || &apos;[]&apos;));
                            </div>
                            <br />

                            <div style={{ color: '#666' }}>{`// 🗑️ Alle Logs löschen:`}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                localStorage.clear(); // oder einzeln löschen
                            </div>
                        </div>

                        <Button
                            onClick={clearAllLogs}
                            size="small"
                            style={{ marginTop: 8 }}
                        >
                            🗑️ Alle Error-Logs löschen
                        </Button>
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

                {/* Erweiterte Hilfreiche Hinweise */}
                <div style={{
                    padding: 12,
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 6
                }}>
                    <Text style={{ fontSize: '12px', color: '#389e0d' }}>
                        💡 <strong>Praktische Lernziele:</strong><br />
                        • <strong>Rote Buttons:</strong> Zeigen was NICHT funktioniert (ErrorBoundary-Grenzen)<br />
                        • <strong>Grüne Buttons:</strong> Zeigen WIE es richtig gemacht wird (mit User-Feedback)<br />
                        • <strong>Logs:</strong> Vergleichen Sie problematische vs. korrekt behandelte Fehler
                    </Text>
                </div>

                <div style={{
                    padding: 12,
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: 6
                }}>
                    <Text style={{ fontSize: '12px', color: '#0958d9' }}>
                        🎓 <strong>Produktions-Ready Ansätze:</strong><br />
                        • <strong>try-catch</strong> für Event-Handler und synchrone Operationen<br />
                        • <strong>Promise.catch()</strong> für asynchrone Operationen<br />
                        • <strong>User-Feedback</strong> mit message/notification Components<br />
                        • <strong>Strukturiertes Logging</strong> für Monitoring und Debugging
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
