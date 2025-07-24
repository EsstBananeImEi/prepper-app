import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Progress, List, message, Popconfirm } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, ClearOutlined } from '@ant-design/icons';
import { ImageCacheManager } from '../../../utils/imageCacheManager';
import styles from './CacheManagement.module.css';

const { Title, Text } = Typography;

interface CacheInfo {
    totalSize: number;
    imageCount: number;
    oldestTimestamp: number;
    sizeFormatted: string;
    cacheUsagePercent: number;
    oldestDate: string;
}

export default function CacheManagement(): React.ReactElement {
    const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const loadCacheInfo = () => {
        const stats = ImageCacheManager.getCacheStats();
        const maxSize = 10 * 1024 * 1024; // 10MB

        setCacheInfo({
            totalSize: stats.totalSize,
            imageCount: stats.imageCount,
            oldestTimestamp: stats.oldestTimestamp,
            sizeFormatted: formatBytes(stats.totalSize),
            cacheUsagePercent: Math.round((stats.totalSize / maxSize) * 100),
            oldestDate: stats.imageCount > 0 ? new Date(stats.oldestTimestamp).toLocaleDateString('de-DE') : 'N/A'
        });
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleCleanExpired = async () => {
        setLoading(true);
        try {
            ImageCacheManager.cleanExpiredImages();
            loadCacheInfo();
            message.success('Abgelaufene Bilder wurden entfernt');
        } catch (error) {
            message.error('Fehler beim Bereinigen des Caches');
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        setLoading(true);
        try {
            ImageCacheManager.clearAllCache();
            loadCacheInfo();
            message.success('Cache wurde vollständig geleert');
        } catch (error) {
            message.error('Fehler beim Leeren des Caches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCacheInfo();
    }, []);

    if (!cacheInfo) {
        return <div>Lade Cache-Informationen...</div>;
    }

    const cacheItems = [
        {
            label: 'Gespeicherte Bilder',
            value: cacheInfo.imageCount.toString(),
            icon: <InfoCircleOutlined />
        },
        {
            label: 'Cache-Größe',
            value: cacheInfo.sizeFormatted,
            icon: <InfoCircleOutlined />
        },
        {
            label: 'Ältestes Bild',
            value: cacheInfo.oldestDate,
            icon: <InfoCircleOutlined />
        }
    ];

    return (
        <div className={styles.container}>
            <Card
                className={styles.card}
                title={
                    <div className={styles.header}>
                        <Title level={4} style={{ margin: 0 }}>
                            Bild-Cache Verwaltung
                        </Title>
                        <Button
                            type="link"
                            icon={<InfoCircleOutlined />}
                            onClick={loadCacheInfo}
                            size="small"
                        >
                            Aktualisieren
                        </Button>
                    </div>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* Cache Usage Progress */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text>Cache-Auslastung</Text>
                            <Text>{cacheInfo.cacheUsagePercent}%</Text>
                        </div>
                        <Progress
                            percent={cacheInfo.cacheUsagePercent}
                            status={cacheInfo.cacheUsagePercent > 80 ? 'exception' : 'normal'}
                            strokeColor={
                                cacheInfo.cacheUsagePercent > 80
                                    ? '#ff4d4f'
                                    : cacheInfo.cacheUsagePercent > 60
                                        ? '#faad14'
                                        : '#52c41a'
                            }
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {cacheInfo.sizeFormatted} von 10 MB verwendet
                        </Text>
                    </div>

                    {/* Cache Statistics */}
                    <List
                        size="small"
                        dataSource={cacheItems}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={item.icon}
                                    title={item.label}
                                    description={item.value}
                                />
                            </List.Item>
                        )}
                    />

                    {/* Cache Actions */}
                    <Space wrap style={{ width: '100%', justifyContent: 'center' }}>
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleCleanExpired}
                            loading={loading}
                            disabled={cacheInfo.imageCount === 0}
                        >
                            Abgelaufene entfernen
                        </Button>

                        <Popconfirm
                            title="Sind Sie sicher, dass Sie den gesamten Cache löschen möchten?"
                            onConfirm={handleClearAll}
                            okText="Ja, löschen"
                            cancelText="Abbrechen"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                loading={loading}
                                disabled={cacheInfo.imageCount === 0}
                            >
                                Cache leeren
                            </Button>
                        </Popconfirm>
                    </Space>

                    {/* Cache Information */}
                    <div className={styles.infoBox}>
                        <Title level={5}>Cache-Informationen</Title>
                        <Text type="secondary">
                            • Gruppenbilder werden automatisch komprimiert und lokal gespeichert<br />
                            • Cache wird automatisch nach 7 Tagen bereinigt<br />
                            • Maximum 10 MB Cache-Größe<br />
                            • Reduziert Netzwerk-Traffic und verbessert Ladezeiten
                        </Text>
                    </div>
                </Space>
            </Card>
        </div>
    );
}
