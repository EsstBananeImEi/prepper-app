import React, { useEffect, useState } from 'react';
import { Card, Typography, Select, Switch, Space, Divider, Button, message, Modal, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import createSecureApiClient, { authApi } from '../../utils/secureApiClient';
import { isAxiosError } from 'axios';
import { userApi } from '../../shared/Constants';
import { useStore } from '../../store/Store';

const { Title, Paragraph, Text } = Typography;

type UnitSystem = 'metric' | 'imperial' | 'custom';

export default function Settings() {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const { dispatch } = useStore();
    const [lang, setLang] = useState<string>(i18n.language || 'de');
    const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => (localStorage.getItem('unitSystem') as UnitSystem) || 'metric');
    const [useShortUnits, setUseShortUnits] = useState<boolean>(() => localStorage.getItem('useShortUnits') === 'true');
    const [deleting, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        // persist language selection
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
    }, [lang, i18n]);

    useEffect(() => {
        localStorage.setItem('unitSystem', unitSystem);
        window.dispatchEvent(new Event('unitPrefsChanged'));
    }, [unitSystem]);

    useEffect(() => {
        localStorage.setItem('useShortUnits', String(useShortUnits));
        window.dispatchEvent(new Event('unitPrefsChanged'));
    }, [useShortUnits]);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
            <Card>
                <Title level={3}>{t('settings.title', 'Einstellungen')}</Title>

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Text strong>{t('settings.language', 'Sprache')}</Text>
                        <Paragraph type="secondary">{t('settings.languageHint', 'Wähle die bevorzugte Sprache der App')}</Paragraph>
                        <Select
                            value={lang}
                            style={{ width: 240 }}
                            onChange={setLang}
                            options={[
                                { value: 'de', label: 'Deutsch' },
                                { value: 'en', label: 'English' },
                            ]}
                        />
                    </div>

                    <Divider />

                    <div>
                        <Text strong>{t('settings.unitsTitle', 'Maßeinheiten')}</Text>
                        <Paragraph type="secondary">{t('settings.unitsHint', 'Wähle das bevorzugte Einheitensystem')}</Paragraph>
                        <Select
                            value={unitSystem}
                            style={{ width: 240 }}
                            onChange={setUnitSystem}
                            options={[
                                { value: 'metric', label: t('settings.units.metric', 'Metrisch (g, kg, l)') },
                                { value: 'imperial', label: t('settings.units.imperial', 'Imperial (oz, lb, gal)') },
                                { value: 'custom', label: t('settings.units.custom', 'Benutzerdefiniert') },
                            ]}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Space>
                                <Text>{t('settings.units.short', 'Kurze Einheiten (z. B. g, kg, l)')}</Text>
                                <Switch checked={useShortUnits} onChange={setUseShortUnits} />
                            </Space>
                        </div>
                        {unitSystem === 'custom' && (
                            <Paragraph type="secondary" style={{ marginTop: 8 }}>
                                {t('settings.units.customNote', 'Benutzerdefinierte Einheiten werden in einer späteren Version unterstützt.')}
                            </Paragraph>
                        )}
                    </div>

                    <Divider />

                    <div>
                        <Text strong style={{ color: '#d4380d' }}>{t('settings.deleteAccount.title', 'Profil löschen')}</Text>
                        <Paragraph type="secondary">{t('settings.deleteAccount.desc', 'Dein Profil und alle zugehörigen Daten werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.')}</Paragraph>
                        <Button danger icon={<DeleteOutlined />} loading={deleting} onClick={() => setConfirmOpen(true)}>
                            {t('settings.deleteAccount.button', 'Profil löschen')}
                        </Button>

                        <Modal
                            open={confirmOpen}
                            title={t('settings.deleteAccount.confirmTitle', 'Profil wirklich löschen?')}
                            okText={t('settings.deleteAccount.confirmOk', 'Ja, löschen')}
                            cancelText={t('settings.deleteAccount.confirmCancel', 'Abbrechen')}
                            okButtonProps={{ danger: true, icon: <ExclamationCircleOutlined /> }}
                            confirmLoading={confirming}
                            onCancel={() => {
                                if (!confirming) { setConfirmOpen(false); setPassword(''); }
                            }}
                            onOk={async () => {
                                if (!password || password.trim().length < 1) {
                                    message.warning(t('settings.deleteAccount.passwordRequired', 'Bitte gib dein Passwort ein.'));
                                    return;
                                }
                                setConfirming(true);
                                setDeleting(true);
                                try {
                                    const api = createSecureApiClient();
                                    await api.delete(userApi, { data: { password } });
                                    try { await authApi.logout(); } catch { /* ignore */ }
                                    localStorage.removeItem('user');
                                    dispatch({ type: 'LOGOUT_USER' });
                                    message.success(t('settings.deleteAccount.success', 'Profil wurde gelöscht.'));
                                    setConfirmOpen(false);
                                    setPassword('');
                                    navigate('/login');
                                } catch (err) {
                                    const status = isAxiosError(err) ? err.response?.status : undefined;
                                    if (status === 401 || status === 403) {
                                        message.error(t('settings.deleteAccount.wrongPassword', 'Falsches Passwort.'));
                                    } else {
                                        message.error(t('settings.deleteAccount.error', 'Löschen fehlgeschlagen. Bitte versuche es erneut.'));
                                    }
                                } finally {
                                    setConfirming(false);
                                    setDeleting(false);
                                }
                            }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text>{t('settings.deleteAccount.passwordLabel', 'Zur Bestätigung gib bitte dein Passwort ein:')}</Text>
                                <Input.Password
                                    autoFocus
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('settings.deleteAccount.passwordPlaceholder', 'Passwort')}
                                />
                            </Space>
                        </Modal>
                    </div>
                </Space>
            </Card>
        </div>
    );
}
