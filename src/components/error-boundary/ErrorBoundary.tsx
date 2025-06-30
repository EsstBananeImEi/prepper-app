import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { BugOutlined, ReloadOutlined } from '@ant-design/icons';

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
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // Hier könnten Sie Error-Reporting-Services integrieren
        // z.B. Sentry, LogRocket, etc.
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        const { hasError, error, errorInfo } = this.state;
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
                            fallbackMessage ||
                            'Es ist ein unerwarteter Fehler aufgetreten. Versuchen Sie, die Seite zu aktualisieren.'
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
