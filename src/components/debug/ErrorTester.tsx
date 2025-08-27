import React, { useState } from 'react';
import { Button, Space, Card, Typography, Alert, Divider, message, notification } from 'antd';
import { BugOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const ErrorTester: React.FC = () => {
    const { t } = useTranslation();
    const [shouldThrow, setShouldThrow] = useState(false);
    const [triggerType, setTriggerType] = useState<string | null>(null);

    if (shouldThrow) {
        // Dieser Fehler wird von der ErrorBoundary abgefangen
        throw new Error('Test Error - ErrorBoundary works!');
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
            message.loading({ content: t('admin.devPanel.errorTester.messages.networkLoading'), key: 'network' });

            const response = await fetch('https://nonexistent-domain-12345.com/api/test');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            message.success({ content: t('admin.devPanel.errorTester.messages.networkSuccess'), key: 'network' });
        } catch (error) {
            // ✅ KORREKTE Behandlung von Network-Fehlern
            console.error('Network Error korrekt behandelt:', error);

            message.error({
                content: t('admin.devPanel.errorTester.messages.networkUserError'),
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

        message.loading({ content: t('admin.devPanel.errorTester.messages.asyncLoading'), key: 'async' });

        asyncOperation
            .then((result) => {
                message.success({ content: t('admin.devPanel.errorTester.messages.asyncSuccess'), key: 'async' });
            })
            .catch((error) => {
                // ✅ KORREKTE Promise-Fehlerbehandlung
                console.error('Async Error korrekt behandelt:', error);

                notification.warning({
                    message: t('admin.devPanel.errorTester.messages.asyncFailedTitle'),
                    description: t('admin.devPanel.errorTester.messages.asyncFailedDesc'),
                    duration: 4,
                    placement: 'topRight'
                });

                message.error({
                    content: t('admin.devPanel.errorTester.messages.asyncFailedMsg'),
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
                message: t('admin.devPanel.errorTester.messages.userActionFailedTitle'),
                description: t('admin.devPanel.errorTester.messages.userActionFailedDesc'),
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
        message.success(t('admin.devPanel.errorTester.messages.clearLogsSuccess'));
    };

    return (
        <Card
            title={
                <div>
                    <BugOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                    {t('admin.devPanel.errorTester.cardTitle')}
                </div>
            }
            style={{ maxWidth: 600, margin: '20px auto' }}
        >
            <Alert
                message={t('admin.devPanel.errorTester.infoAlertTitle')}
                description={
                    <div>
                        <p><strong>{t('admin.devPanel.errorTester.infoAlertDesc1')}</strong></p>
                        <p><strong>{t('admin.devPanel.errorTester.infoAlertDesc2')}</strong></p>
                        <p><strong>{t('admin.devPanel.errorTester.infoAlertDesc3')}</strong></p>
                    </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Buttons die ErrorBoundary auslösen */}
                <div>
                    <Text strong style={{ color: '#52c41a' }}>{t('admin.devPanel.errorTester.sections.caught')}</Text>

                    <Button
                        type="primary"
                        danger
                        onClick={() => setShouldThrow(true)}
                        block
                        style={{ marginTop: 8 }}
                    >
                        {t('admin.devPanel.errorTester.buttons.throwError')}
                    </Button>

                    <Button
                        type="default"
                        danger
                        onClick={triggerTypeError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        {t('admin.devPanel.errorTester.buttons.typeError')}
                    </Button>

                    <Button
                        type="default"
                        danger
                        onClick={triggerReferenceError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        {t('admin.devPanel.errorTester.buttons.referenceError')}
                    </Button>

                    <Button
                        type="default"
                        danger
                        onClick={triggerNetworkError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        {t('admin.devPanel.errorTester.buttons.networkErrorSim')}
                    </Button>
                </div>

                <Divider />

                {/* Buttons die NICHT abgefangen werden */}
                <div>
                    <Text strong style={{ color: '#ff4d4f' }}>{t('admin.devPanel.errorTester.sections.uncaught')}</Text>

                    <Button
                        type="dashed"
                        onClick={triggerRealNetworkError}
                        block
                        style={{ marginTop: 8 }}
                    >
                        {t('admin.devPanel.errorTester.buttons.realNetworkError')}
                    </Button>

                    <Button
                        type="dashed"
                        onClick={triggerAsyncError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        {t('admin.devPanel.errorTester.buttons.asyncError')}
                    </Button>

                    <Button
                        type="dashed"
                        onClick={triggerEventHandlerError}
                        block
                        style={{ marginTop: 4 }}
                    >
                        {t('admin.devPanel.errorTester.buttons.eventHandlerError')}
                    </Button>
                </div>

                <Divider />

                {/* Buttons die RICHTIGE Fehlerbehandlung zeigen */}
                <div>
                    <Text strong style={{ color: '#1890ff' }}>{t('admin.devPanel.errorTester.sections.proper')}</Text>

                    <Button
                        type="primary"
                        onClick={properNetworkErrorHandling}
                        block
                        style={{ marginTop: 8, background: '#52c41a', borderColor: '#52c41a' }}
                        icon={<CheckCircleOutlined />}
                    >
                        {t('admin.devPanel.errorTester.buttons.properNetwork')}
                    </Button>

                    <Button
                        type="primary"
                        onClick={properAsyncErrorHandling}
                        block
                        style={{ marginTop: 4, background: '#52c41a', borderColor: '#52c41a' }}
                        icon={<CheckCircleOutlined />}
                    >
                        {t('admin.devPanel.errorTester.buttons.properAsync')}
                    </Button>

                    <Button
                        type="primary"
                        onClick={properEventHandlerErrorHandling}
                        block
                        style={{ marginTop: 4, background: '#52c41a', borderColor: '#52c41a' }}
                        icon={<CheckCircleOutlined />}
                    >
                        {t('admin.devPanel.errorTester.buttons.properEvent')}
                    </Button>
                </div>

                <Divider />

                {/* Informations-Sektion für manuelle Fehler-Logs */}
                <Card size="small" title={t('admin.devPanel.errorTester.logsInspector.title')}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Alert
                            message={t('admin.devPanel.errorTester.logsInspector.alertTitle')}
                            description={
                                <div style={{ fontSize: '11px' }}>
                                    <p><strong style={{ color: '#ff4d4f' }}>{t('admin.devPanel.errorTester.logsInspector.manual')}</strong></p>
                                    <p><strong style={{ color: '#52c41a' }}>{t('admin.devPanel.errorTester.logsInspector.proper')}</strong></p>
                                    <p><strong style={{ color: '#1890ff' }}>{t('admin.devPanel.errorTester.logsInspector.boundary')}</strong></p>
                                </div>
                            }
                            type="info"
                            showIcon={false}
                            style={{ marginBottom: 12 }}
                        />

                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {t('admin.devPanel.errorTester.logsInspector.consoleTitle')}
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
                            <div style={{ color: '#ff4d4f' }}>{t('admin.devPanel.errorTester.logsInspector.comment.problematic')}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                console.log(JSON.parse(localStorage.getItem(&apos;manual_error_logs&apos;) || &apos;[]&apos;));
                            </div>
                            <br />

                            <div style={{ color: '#52c41a' }}>{t('admin.devPanel.errorTester.logsInspector.comment.proper')}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                console.log(JSON.parse(localStorage.getItem(&apos;properly_handled_errors&apos;) || &apos;[]&apos;));
                            </div>
                            <br />

                            <div style={{ color: '#1890ff' }}>{t('admin.devPanel.errorTester.logsInspector.comment.boundary')}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                console.log(JSON.parse(localStorage.getItem(&apos;error_logs&apos;) || &apos;[]&apos;));
                            </div>
                            <br />

                            <div style={{ color: '#666' }}>{t('admin.devPanel.errorTester.logsInspector.comment.clear')}</div>
                            <div style={{ wordBreak: 'break-all' }}>
                                localStorage.clear(); // oder einzeln löschen
                            </div>
                        </div>

                        <Button
                            onClick={clearAllLogs}
                            size="small"
                            style={{ marginTop: 8 }}
                        >
                            {t('admin.devPanel.errorTester.logsInspector.clearButton')}
                        </Button>
                    </Space>
                </Card>

                <Button
                    type="default"
                    onClick={closeErrorOverlay}
                    block
                    style={{ marginTop: 8 }}
                >
                    {t('admin.devPanel.errorTester.buttons.closeOverlay')}
                </Button>

                {/* Erweiterte Hilfreiche Hinweise */}
                <div style={{
                    padding: 12,
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 6
                }}>
                    <Text style={{ fontSize: '12px', color: '#389e0d' }}>
                        {t('admin.devPanel.testing.title')}<br />
                        {/* Reusing testing context bullet points from devPanel.info for consistency */}
                        • <strong>{t('admin.devPanel.info.bullets.errorBoundary')}</strong><br />
                        • <strong>{t('admin.devPanel.info.bullets.errorLogging')}</strong><br />
                        • <strong>{t('admin.devPanel.logs.instructions')}</strong>
                    </Text>
                </div>

                <div style={{
                    padding: 12,
                    background: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: 6
                }}>
                    <Text style={{ fontSize: '12px', color: '#0958d9' }}>
                        {t('admin.devPanel.env.title')}
                    </Text>
                </div>

                <div style={{
                    padding: 12,
                    background: '#fff2e8',
                    border: '1px solid #ffbb96',
                    borderRadius: 6
                }}>
                    <Text style={{ fontSize: '12px', color: '#d46b08' }}>
                        {t('admin.devPanel.testing.warningTitle')} {t('admin.devPanel.testing.warningDesc')}
                    </Text>
                </div>
            </Space>
        </Card>
    );
};

export default ErrorTester;
