import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Progress, List, message, Popconfirm } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, ClearOutlined } from '@ant-design/icons';
import { ImageCacheManager } from '../../../utils/imageCacheManager';
import styles from './CacheManagement.module.css';
import { useTranslation } from 'react-i18next';

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
    const { t, i18n } = useTranslation();
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
            oldestDate: stats.imageCount > 0 ? new Date(stats.oldestTimestamp).toLocaleDateString(i18n.language) : 'N/A'
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
            message.success(t('admin.cache.toasts.cleanedExpired'));
        } catch (error) {
            message.error(t('admin.cache.toasts.cleanError'));
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        setLoading(true);
        try {
            ImageCacheManager.clearAllCache();
            loadCacheInfo();
            message.success(t('admin.cache.toasts.clearedAll'));
        } catch (error) {
            message.error(t('admin.cache.toasts.clearError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCacheInfo();
    }, []);

    if (!cacheInfo) {
    return <div>{t('admin.cache.loading')}</div>;
    }

    const cacheItems = [
        {
            label: t('admin.cache.labels.imagesStored'),
            value: cacheInfo.imageCount.toString(),
            icon: <InfoCircleOutlined />
        },
        {
            label: t('admin.cache.labels.cacheSize'),
            value: cacheInfo.sizeFormatted,
            icon: <InfoCircleOutlined />
        },
        {
            label: t('admin.cache.labels.oldestImage'),
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
                            {t('admin.cache.title')}
                        </Title>
                        <Button
                            type="link"
                            icon={<InfoCircleOutlined />}
                            onClick={loadCacheInfo}
                            size="small"
                        >
                            {t('admin.cache.refresh')}
                        </Button>
                    </div>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* Cache Usage Progress */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text>{t('admin.cache.usage')}</Text>
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
                            {t('admin.cache.usedOf', { size: cacheInfo.sizeFormatted, max: t('admin.cache.maxMB') })}
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
                            {t('admin.cache.buttons.cleanExpired')}
                        </Button>

                        <Popconfirm
                            title={t('admin.cache.confirm.clearTitle')}
                            onConfirm={handleClearAll}
                            okText={t('admin.cache.confirm.ok')}
                            cancelText={t('admin.cache.confirm.cancel')}
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                loading={loading}
                                disabled={cacheInfo.imageCount === 0}
                            >
                                {t('admin.cache.buttons.clearAll')}
                            </Button>
                        </Popconfirm>
                    </Space>

                    {/* Cache Information */}
                    <div className={styles.infoBox}>
                        <Title level={5}>{t('admin.cache.info.title')}</Title>
                        <Text type="secondary">
                            {t('admin.cache.info.line1')}<br />
                            {t('admin.cache.info.line2')}<br />
                            {t('admin.cache.info.line3')}<br />
                            {t('admin.cache.info.line4')}
                        </Text>
                    </div>
                </Space>
            </Card>
        </div>
    );
}
