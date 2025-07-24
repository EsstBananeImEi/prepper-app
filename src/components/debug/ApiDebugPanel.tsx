
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Badge, Button, Timeline, Typography, Space, Alert } from 'antd';
import { BugOutlined, WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, DragOutlined, CloseOutlined } from '@ant-design/icons';
import { apiDebugger, ApiRequestLog, analyzeApiError } from '../../utils/apiDebugger';
import styles from './ApiDebugPanel.module.css';

const { Text, Paragraph } = Typography;

interface Props {
    visible: boolean;
    onClose: () => void;
}

interface Position {
    x: number;
    y: number;
}

export default function ApiDebugPanel({ visible, onClose }: Props) {
    const [logs, setLogs] = useState<ApiRequestLog[]>([]);
    const [healthStatus, setHealthStatus] = useState({
        totalRequests: 0,
        errorCount: 0,
        errorRate: 0,
        lastHourRequests: 0
    });

    // Draggable functionality
    const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const panelRef = useRef<HTMLDivElement>(null);

    // Set initial position based on screen size
    useEffect(() => {
        const updateInitialPosition = () => {
            const isMobile = window.innerWidth <= 600;
            if (isMobile) {
                // Mobile: position above bottom navigation (90px from bottom)
                setPosition({
                    x: 20,
                    y: window.innerHeight - 450 // panel height + bottom nav height
                });
            } else {
                // Desktop: bottom right corner
                setPosition({
                    x: window.innerWidth - 420, // panel width + margin
                    y: window.innerHeight - 500 // panel height + margin
                });
            }
        };

        if (visible) {
            updateInitialPosition();
            window.addEventListener('resize', updateInitialPosition);
            return () => window.removeEventListener('resize', updateInitialPosition);
        }
    }, [visible]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLogs(apiDebugger.getRecentLogs());
            setHealthStatus(apiDebugger.getHealthStatus());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Mouse event handlers for dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!panelRef.current) return;

        const rect = panelRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Constrain to viewport
        const maxX = window.innerWidth - 400; // panel width
        const maxY = window.innerHeight - 500; // panel height

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    }, [isDragging, dragOffset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch event handlers for mobile dragging
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!panelRef.current) return;

        const touch = e.touches[0];
        const rect = panelRef.current.getBoundingClientRect();
        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        });
        setIsDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const touch = e.touches[0];
        const newX = touch.clientX - dragOffset.x;
        const newY = touch.clientY - dragOffset.y;

        // Constrain to viewport
        const maxX = window.innerWidth - 400; // panel width
        const maxY = window.innerHeight - 500; // panel height

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    }, [isDragging, dragOffset]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add global event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
            const error = { response: { status: log.status || 500, data: { error: log.error } } };
            return analyzeApiError(error);
        } catch {
            return null;
        }
    };

    if (!visible) return null;

    return (
        <div
            ref={panelRef}
            className={styles.debugPanel}
            style={{
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 10000 // Above everything including bottom navigation
            }}
        >
            {/* Draggable Header */}
            <div
                className={styles.dragHandle}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <Space>
                    <DragOutlined />
                    <BugOutlined />
                    API Debug Panel
                    <Badge count={healthStatus.errorCount} status="error" />
                </Space>
                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={onClose}
                    className={styles.closeButton}
                />
            </div>

            {/* Panel Content */}
            <div className={styles.panelContent}>
                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                    <Space size="small">
                        <Button size="small" onClick={clearLogs}>Clear</Button>
                        <Button size="small" onClick={exportLogs}>Export</Button>
                    </Space>
                </div>

                <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {/* Health Status */}
                    <Card size="small" title="API Health Status" className={styles.statusCard}>
                        <Space wrap size="small">
                            <Text style={{ fontSize: '12px' }}>
                                Total: <strong>{healthStatus.totalRequests}</strong>
                            </Text>
                            <Text type={healthStatus.errorCount > 0 ? 'danger' : 'success'} style={{ fontSize: '12px' }}>
                                Errors: <strong>{healthStatus.errorCount}</strong>
                            </Text>
                            <Text type={healthStatus.errorRate > 10 ? 'danger' : 'success'} style={{ fontSize: '12px' }}>
                                Rate: <strong>{healthStatus.errorRate.toFixed(1)}%</strong>
                            </Text>
                            <Text style={{ fontSize: '12px' }}>
                                Last Hour: <strong>{healthStatus.lastHourRequests}</strong>
                            </Text>
                        </Space>
                    </Card>

                    {/* Error Summary */}
                    {healthStatus.errorCount > 0 && (
                        <Alert
                            message="API Errors Detected"
                            description={`${healthStatus.errorCount} errors in ${healthStatus.totalRequests} requests`}
                            type="warning"
                            showIcon
                            style={{ fontSize: '12px' }}
                        />
                    )}

                    {/* Request Timeline */}
                    <Card size="small" title="Recent Requests" className={styles.timelineCard}>
                        <div className={styles.timelineContainer}>
                            {logs.length === 0 ? (
                                <Text type="secondary" style={{ fontSize: '12px' }}>No API requests logged yet</Text>
                            ) : (
                                <Timeline>
                                    {logs.slice(0, 10).map((log, index) => {
                                        const analysis = getErrorAnalysis(log);
                                        return (
                                            <Timeline.Item
                                                key={index}
                                                dot={getStatusIcon(log)}
                                                color={getStatusColor(log)}
                                            >
                                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                    <Space size="small" wrap>
                                                        <Text strong style={{ fontSize: '11px' }}>{log.method}</Text>
                                                        <Text code style={{ fontSize: '10px' }}>
                                                            {log.url.length > 30 ? `${log.url.substring(0, 30)}...` : log.url}
                                                        </Text>
                                                        {log.status && (
                                                            <Badge
                                                                count={log.status}
                                                                style={{
                                                                    backgroundColor: log.error ? '#ff4d4f' : '#52c41a',
                                                                    fontSize: '10px'
                                                                }}
                                                            />
                                                        )}
                                                        {log.duration && (
                                                            <Text type="secondary" style={{ fontSize: '10px' }}>
                                                                {formatDuration(log.duration)}
                                                            </Text>
                                                        )}
                                                    </Space>

                                                    <Text type="secondary" style={{ fontSize: '10px' }}>
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </Text>

                                                    {log.error && (
                                                        <Alert
                                                            message={analysis?.category || 'Error'}
                                                            description={
                                                                <Paragraph style={{ margin: 0, fontSize: '10px' }}>
                                                                    {analysis?.suggestion || log.error}
                                                                </Paragraph>
                                                            }
                                                            type="error"
                                                            style={{ marginTop: 2, fontSize: '10px' }}
                                                        />
                                                    )}
                                                </Space>
                                            </Timeline.Item>
                                        );
                                    })}
                                </Timeline>
                            )}
                        </div>
                    </Card>
                </Space>
            </div>
        </div>
    );
}
