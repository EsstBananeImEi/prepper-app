
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Timeline, Modal, Typography, Space, Alert } from 'antd';
import { BugOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { apiDebugger, ApiRequestLog, analyzeApiError } from '../../utils/apiDebugger';

const { Text, Paragraph } = Typography;

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function ApiDebugPanel({ visible, onClose }: Props) {
    const [logs, setLogs] = useState<ApiRequestLog[]>([]);
    const [healthStatus, setHealthStatus] = useState({
        totalRequests: 0,
        errorCount: 0,
        errorRate: 0,
        lastHourRequests: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(apiDebugger.getRecentLogs());
            setHealthStatus(apiDebugger.getHealthStatus());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (log: ApiRequestLog) => {
        if (log.error) {
            return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
        }
        if (log.status && log.status >= 200 && log.status < 300) {
            return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        }
        return <WarningOutlined style={{ color: '#faad14' }} />;
    };

    const getStatusColor = (log: ApiRequestLog) => {
        if (log.error) return '#ff4d4f';
        if (log.status && log.status >= 200 && log.status < 300) return '#52c41a';
        return '#faad14';
    };

    const formatDuration = (duration?: number) => {
        if (!duration) return '';
        if (duration < 1000) return `${duration}ms`;
        return `${(duration / 1000).toFixed(1)}s`;
    };

    const clearLogs = () => {
        apiDebugger.clearLogs();
        setLogs([]);
        setHealthStatus({
            totalRequests: 0,
            errorCount: 0,
            errorRate: 0,
            lastHourRequests: 0
        });
    };

    const exportLogs = () => {
        const data = apiDebugger.exportLogs();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `api-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const getErrorAnalysis = (log: ApiRequestLog) => {
        if (!log.error) return null;

        try {
            const error = { response: { status: log.status, data: { error: log.error } } };
            return analyzeApiError(error);
        } catch {
            return null;
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <BugOutlined />
                    API Debug Panel
                    <Badge count={healthStatus.errorCount} status="error" />
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            footer={
                <Space>
                    <Button onClick={clearLogs}>Clear Logs</Button>
                    <Button onClick={exportLogs}>Export Logs</Button>
                    <Button type="primary" onClick={onClose}>Close</Button>
                </Space>
            }
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                {/* Health Status */}
                <Card size="small" title="API Health Status">
                    <Space wrap>
                        <Text>
                            Total Requests: <strong>{healthStatus.totalRequests}</strong>
                        </Text>
                        <Text type={healthStatus.errorCount > 0 ? 'danger' : 'success'}>
                            Errors: <strong>{healthStatus.errorCount}</strong>
                        </Text>
                        <Text type={healthStatus.errorRate > 10 ? 'danger' : 'success'}>
                            Error Rate: <strong>{healthStatus.errorRate.toFixed(1)}%</strong>
                        </Text>
                        <Text>
                            Last Hour: <strong>{healthStatus.lastHourRequests}</strong>
                        </Text>
                    </Space>
                </Card>

                {/* Error Summary */}
                {healthStatus.errorCount > 0 && (
                    <Alert
                        message="API Errors Detected"
                        description={`${healthStatus.errorCount} API errors in the last ${healthStatus.totalRequests} requests. Check the logs below for details.`}
                        type="warning"
                        showIcon
                    />
                )}

                {/* Request Timeline */}
                <Card size="small" title="Recent API Requests" style={{ maxHeight: 400, overflow: 'auto' }}>
                    {logs.length === 0 ? (
                        <Text type="secondary">No API requests logged yet</Text>
                    ) : (<Timeline>
                        {logs.slice(0, 20).map((log, index) => {
                            const analysis = getErrorAnalysis(log);
                            return (
                                <Timeline.Item
                                    key={index}
                                    dot={getStatusIcon(log)}
                                    color={getStatusColor(log)}
                                >
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Space>
                                            <Text strong>{log.method}</Text>
                                            <Text code>{log.url}</Text>
                                            {log.status && (
                                                <Badge
                                                    count={log.status}
                                                    style={{
                                                        backgroundColor: log.error ? '#ff4d4f' : '#52c41a'
                                                    }}
                                                />
                                            )}
                                            {log.duration && (
                                                <Text type="secondary">{formatDuration(log.duration)}</Text>
                                            )}
                                        </Space>

                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </Text>

                                        {log.error && (
                                            <Alert
                                                message={analysis?.category || 'Error'}
                                                description={
                                                    <div>
                                                        <Paragraph style={{ margin: 0, fontSize: '12px' }}>
                                                            {analysis?.suggestion || log.error}
                                                        </Paragraph>
                                                        {process.env.NODE_ENV === 'development' && (
                                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                {log.error}
                                                            </Text>
                                                        )}
                                                    </div>
                                                }
                                                type="error"
                                                style={{ marginTop: 4, fontSize: '12px' }}
                                            />
                                        )}
                                    </Space>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                    )}
                </Card>
            </Space>
        </Modal>
    );
}
