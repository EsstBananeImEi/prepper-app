import React, { useEffect, useState } from 'react';
import { Card, Typography, Select, Switch, Space, Divider } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph, Text } = Typography;

type UnitSystem = 'metric' | 'imperial' | 'custom';

export default function Settings() {
    const { i18n, t } = useTranslation();
    const [lang, setLang] = useState<string>(i18n.language || 'de');
    const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => (localStorage.getItem('unitSystem') as UnitSystem) || 'metric');
    const [useShortUnits, setUseShortUnits] = useState<boolean>(() => localStorage.getItem('useShortUnits') === 'true');

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
                </Space>
            </Card>
        </div>
    );
}
