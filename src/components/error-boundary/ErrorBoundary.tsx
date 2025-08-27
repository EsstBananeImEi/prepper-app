import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { BugOutlined, ReloadOutlined, MailOutlined } from '@ant-design/icons';
import { errorsApi, errorsNotifyApi } from '../../shared/Constants';
import createSecureApiClient from '../../utils/secureApiClient';

const { Paragraph, Text } = Typography;

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
    showDetails?: boolean;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    errorId?: string;
}

interface ErrorReport {
    errorId: string;
    timestamp: string;
    userAgent: string;
    url: string;
    userId: string | null;
    error: {
        name: string;
        message: string;
        stack?: string;
    };
    componentStack: string | null | undefined;
    environment: string | undefined;
    failedServerUpload?: boolean;
    retryAttempt?: boolean;
    retryTimestamp?: string;
    uploadedOnRetry?: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    private retryTimer: NodeJS.Timeout | null = null;

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidMount() {
        // Versuche beim Start, failed logs hochzuladen
        this.retryFailedUploads();

        // Setze einen Timer für regelmäßige Retry-Versuche
        this.retryTimer = setInterval(() => {
            this.retryFailedUploads();
        }, 5 * 60 * 1000); // Alle 5 Minuten
    }

    componentWillUnmount() {
        if (this.retryTimer) {
            clearInterval(this.retryTimer);
        }
    }

    static getDerivedStateFromError(error: Error): State {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { hasError: true, error, errorId };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.setState({
            error,
            errorInfo,
            errorId
        });

        // Fehler-Reporting
        this.reportError(error, errorInfo, errorId);
    }

    private reportError = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
        const errorReport = {
            errorId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getCurrentUserId(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            componentStack: errorInfo.componentStack,
            environment: process.env.NODE_ENV
        };

        // 1. Lokales Logging
        this.logToLocalStorage(errorReport);

        // 2. Server Logging
        await this.logToServer(errorReport);

        // 3. Email-Benachrichtigung (nur in Production bei kritischen Fehlern)
        if (process.env.NODE_ENV === 'production' && this.isCriticalError(error)) {
            await this.sendErrorEmail(errorReport);
        }
    };

    private logToLocalStorage = (errorReport: ErrorReport) => {
        try {
            const existingErrors = JSON.parse(localStorage.getItem('error_logs') || '[]');
            existingErrors.push(errorReport);

            // Behalte nur die letzten 50 Fehler
            const recentErrors = existingErrors.slice(-50);
            localStorage.setItem('error_logs', JSON.stringify(recentErrors));
        } catch (e) {
            console.error('Failed to log to localStorage:', e);
        }
    };

    private logToServer = async (errorReport: ErrorReport) => {
        try {

            const api = createSecureApiClient();
            await api.post(errorsApi, errorReport);
        } catch (e) {
            console.error('Failed to log to server:', e);
            // Fallback: Speichere in localStorage für späteren Upload
            this.logToLocalStorage({ ...errorReport, failedServerUpload: true });
        }
    };

    private sendErrorEmail = async (errorReport: ErrorReport) => {
        try {

            const api = createSecureApiClient();
            await api.post(errorsNotifyApi, {
                ...errorReport,
                notificationType: 'email'
            });
        } catch (e) {
            console.error('Failed to send error email:', e);
        }
    };

    private isCriticalError = (error: Error): boolean => {
        const criticalPatterns = [
            'ChunkLoadError',
            'TypeError: Cannot read prop',
            'ReferenceError',
            'Network Error'
        ];

        return criticalPatterns.some(pattern =>
            error.name.includes(pattern) || error.message.includes(pattern)
        );
    };

    private getCurrentUserId = (): string | null => {
        try {
            // Passen Sie dies an Ihre User-Management-Logik an
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            return user?.id || null;
        } catch {
            return null;
        }
    };

    private retryFailedUploads = async () => {
        try {
            const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            const failedUploads = errorLogs.filter((log: ErrorReport) => log.failedServerUpload);

            if (failedUploads.length === 0) return;

            console.log(`Versuche ${failedUploads.length} fehlgeschlagene Error-Logs erneut hochzuladen...`);

            const successfulRetries: ErrorReport[] = [];

            for (const errorReport of failedUploads) {
                try {
                    const api = createSecureApiClient();
                    await api.post(errorsApi, {
                        ...errorReport,
                        retryAttempt: true,
                        retryTimestamp: new Date().toISOString()
                    });

                    // Erfolgreich hochgeladen - von failed logs entfernen
                    successfulRetries.push(errorReport);
                    console.log(`Error-Log ${errorReport.errorId} erfolgreich nachträglich hochgeladen`);

                } catch (retryError) {
                    console.warn(`Retry für Error-Log ${errorReport.errorId} fehlgeschlagen:`, retryError);
                }
            }

            // Erfolgreich hochgeladene Logs aus localStorage entfernen
            if (successfulRetries.length > 0) {
                const updatedLogs = errorLogs.map((log: ErrorReport) => {
                    const wasRetried = successfulRetries.find(retry => retry.errorId === log.errorId);
                    if (wasRetried) {
                        // Entferne failedServerUpload Flag oder entferne Log komplett
                        const { failedServerUpload, ...cleanLog } = log;
                        return { ...cleanLog, uploadedOnRetry: true };
                    }
                    return log;
                });

                localStorage.setItem('error_logs', JSON.stringify(updatedLogs));
                console.log(`${successfulRetries.length} Error-Logs erfolgreich nachträglich hochgeladen`);
            }

        } catch (e) {
            console.error('Fehler beim Retry von failed uploads:', e);
        }
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleSendReport = () => {
        const { error, errorInfo, errorId } = this.state;
        if (error && errorInfo && errorId) {
            // Nochmaliger Versuch, den Fehler zu senden
            this.reportError(error, errorInfo, errorId);
        }
    };

    render() {
        const { hasError, error, errorInfo, errorId } = this.state;
        const { children, fallbackMessage, showDetails = false } = this.props;

        if (hasError) {
            return (
                <div style={{
                    padding: 'var(--spacing-xl)',
                    minHeight: '50vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Result
                        status="error"
                        icon={<BugOutlined style={{ color: '#ff4d4f' }} />}
                        title="Etwas ist schiefgelaufen"
                        subTitle={
                            <div>
                                <p>{fallbackMessage || 'Es ist ein unerwarteter Fehler aufgetreten. Versuchen Sie, die Seite zu aktualisieren.'}</p>
                                {errorId && (
                                    <p style={{ fontSize: '12px', color: '#666' }}>
                                        Fehler-ID: {errorId}
                                    </p>
                                )}
                            </div>
                        }
                        extra={[
                            <Button
                                key="reload"
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={this.handleReload}
                            >
                                Seite neu laden
                            </Button>,
                            <Button
                                key="home"
                                onClick={this.handleGoHome}
                            >
                                Zur Startseite
                            </Button>,
                            <Button
                                key="report"
                                type="dashed"
                                icon={<MailOutlined />}
                                onClick={this.handleSendReport}
                            >
                                Fehlerbericht senden
                            </Button>
                        ]}
                    >
                        {showDetails && error && (
                            <div style={{ textAlign: 'left', marginTop: 'var(--spacing-lg)' }}>
                                <Paragraph>
                                    <Text strong>Fehlerdetails:</Text>
                                </Paragraph>
                                <Paragraph>
                                    <Text code>{error.name}: {error.message}</Text>
                                </Paragraph>
                                {errorInfo && (
                                    <details style={{ marginTop: 'var(--spacing-md)' }}>
                                        <summary>Stack Trace</summary>
                                        <pre style={{
                                            background: '#f5f5f5',
                                            padding: 'var(--spacing-md)',
                                            borderRadius: 'var(--border-radius-sm)',
                                            fontSize: '12px',
                                            overflow: 'auto',
                                            maxHeight: '200px'
                                        }}>
                                            {errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                    </Result>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;