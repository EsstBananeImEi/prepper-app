import React, { ReactElement, useEffect, useState } from 'react';
import { Modal, Typography, Space, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useStore } from '../../store/Store';
import { useTranslation } from 'react-i18next';
import { impressumRoute, privacyRoute } from '../../shared/Constants';
import axios from 'axios';
import styles from './PoliciesGate.module.css';
import Impressum from './Impressum';
import Privacy from './Privacy';

const { Text } = Typography;

export default function PoliciesGate(): ReactElement | null {
    const { store, dispatch } = useStore();
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [viewer, setViewer] = useState<null | 'impressum' | 'privacy'>(null);

    useEffect(() => {
        const user = store.user;
        const needs = !!user && user.accepted_policies === false;
        setVisible(!!user && needs);
    }, [store.user]);

    if (!visible) return null;

    const handleDecline = async () => {
        try {
            // best-effort server logout; uses refresh token from localStorage via helper
            const { authApi } = await import('../../utils/secureApiClient');
            await authApi.logout();
        } catch {
            // ignore logout errors (best-effort)
        }
        dispatch({ type: 'LOGOUT_USER' });
        setVisible(false);
    };

    const handleAccept = async () => {
        try {
            const baseUrl = process.env.REACT_APP_API_URL || '';
            const token = store.user?.access_token;
            await axios.put(
                `${baseUrl}/user`,
                { accepted_policies: true },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            const next = { ...(store.user || {}), accepted_policies: true } as import('../../shared/Models').UserModel;
            localStorage.setItem('user', JSON.stringify(next));
            dispatch({ type: 'EDIT_USER', user: next });
            setVisible(false);
        } catch (e) {
            // stay visible if failed
        }
    };

    return (
        <Modal
            open={visible}
            title={viewer === 'impressum'
                ? t('common.impressum', 'Impressum')
                : viewer === 'privacy'
                    ? t('common.privacy', 'Datenschutz')
                    : t('legal.policiesGate.title')}
            closable={false}
            maskClosable={false}
            keyboard={false}
            footer={null}
            destroyOnClose
            width={800}
            bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {viewer === null && (
                    <>
                        <Text>
                            {t('legal.policiesGate.textPrefix', 'Bitte bestätige, dass du folgende Richtlinien gelesen hast:')}
                        </Text>
                        <div className={styles.inlineRow}>
                            <a
                                href={impressumRoute}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setViewer('impressum');
                                }}
                            >
                                {t('common.impressum', 'Impressum')}
                            </a>
                            <span>{t('auth.acceptPolicies.and', 'und')}</span>
                            <a
                                href={privacyRoute}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setViewer('privacy');
                                }}
                            >
                                {t('common.privacy', 'Datenschutz')}
                            </a>
                        </div>
                    </>
                )}

                {viewer !== null && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                type="link"
                                icon={<ArrowLeftOutlined />}
                                aria-label={t('common.back', 'Zurück')}
                                onClick={() => setViewer(null)}
                            >
                                {t('legal.policiesGate.closeReader', 'Lesemodus schließen')}
                            </Button>
                        </div>
                        <div className={styles.viewer}>
                            {viewer === 'impressum' ? <Impressum /> : <Privacy />}
                        </div>
                    </>
                )}

                <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button onClick={handleDecline}>{t('common.cancel', 'Ablehnen')}</Button>
                    <Button type="primary" onClick={handleAccept}>{t('common.ok', 'Akzeptieren')}</Button>
                </Space>
            </Space>
        </Modal>
    );
}
