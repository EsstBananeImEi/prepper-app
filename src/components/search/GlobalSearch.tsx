import React, { useState, useEffect, useMemo } from 'react';
import { Input, AutoComplete, Empty, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import { BasketModel, StorageModel } from '../storage-components/StorageModel';
import { useTranslation } from 'react-i18next';
import { basketRoute, checklistRoute, detailsRouteBase, itemIdRoute, itemsRoute, newItemRoute } from '../../shared/Constants';
import logger from '../../utils/logger';

const { Text } = Typography;

interface EmergencyCategory {
    key: string;
    title: string;
    path: string;
}

interface Page {
    key: string;
    title: string;
    path: string;
}

interface ChecklistItem {
    name: string;
    description: string;
    requiredKeys: string[];
    requiredAmount: number;
    unit: string;
    perPerson: boolean;
    consumable: boolean;
    groupName: string; // Für die Suche hinzugefügt
}

interface SearchResult {
    value: string;
    label: React.ReactNode;
    type: 'storage' | 'emergency' | 'page' | 'shopping' | 'checklist';
    data?: StorageModel | EmergencyCategory | Page | BasketModel | ChecklistItem;
}

const GlobalSearch: React.FC = () => {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState<SearchResult[]>([]);
    const { store } = useStore();
    const navigate = useNavigate();

    // Emergency/Notfall-Kategorien für die Suche (Titel via i18n, Pfade via Routen-Konstanten)
    const emergencyCategoryKeys: string[] = [
        'lebensmittel',
        'wasser',
        'medikamente',
        'hygiene',
        'informieren',
        'dokumente',
        'gepaeck',
        'sicherheit',
        'beduerfnisse'
    ];
    const emergencyCategories = emergencyCategoryKeys.map((key) => ({
        key,
        title: t(`emergency.titles.${key}`),
        path: `${detailsRouteBase}/${key}`
    }));

    // Seiten für die Suche
    const pages = [
        { key: 'storage', title: t('search.pages.storage'), path: itemsRoute },
        { key: 'checklist', title: t('search.pages.checklist'), path: checklistRoute },
        { key: 'basket', title: t('search.pages.basket'), path: basketRoute },
        { key: 'add-item', title: t('search.pages.addItem'), path: newItemRoute }
    ];

    // Checklist-Daten für die Suche (aus CheckListItem.tsx)
    const checklistItems: ChecklistItem[] = [
        // Lebensmittel
        { name: 'Trinkwasser', description: 'Mindestens 2 Liter pro Tag pro Person, also 20 Liter für 10 Tage.', requiredKeys: ['wasser', 'trinkwasser', 'mineralwasser'], requiredAmount: 2, unit: 'Liter', perPerson: true, consumable: true, groupName: 'Lebensmittel' },
        { name: 'Getreide, Getreideprodukte, Brot', description: '3,5 kg für 10 Tage pro Person.', requiredKeys: ['getreide', 'brot', 'getreideprodukte'], requiredAmount: 3.5, unit: 'kg', perPerson: true, consumable: true, groupName: 'Lebensmittel' },
        { name: 'Gemüse & Hülsenfrüchte', description: '4,0 kg für 10 Tage pro Person.', requiredKeys: ['gemüse', 'hülsenfrüchte'], requiredAmount: 4.0, unit: 'kg', perPerson: true, consumable: true, groupName: 'Lebensmittel' },
        { name: 'Obst & Nüsse', description: '2,5 kg für 10 Tage pro Person.', requiredKeys: ['obst', 'nüsse'], requiredAmount: 2.5, unit: 'kg', perPerson: true, consumable: true, groupName: 'Lebensmittel' },
        { name: 'Milch & Milchprodukte', description: '2,8 kg für 10 Tage pro Person.', requiredKeys: ['milch', 'milchprodukte'], requiredAmount: 2.8, unit: 'kg', perPerson: true, consumable: true, groupName: 'Lebensmittel' },
        { name: 'Fleisch, Fisch & Eier', description: '1,5 kg für 10 Tage pro Person.', requiredKeys: ['fleisch', 'fisch', 'eier'], requiredAmount: 1.5, unit: 'kg', perPerson: true, consumable: true, groupName: 'Lebensmittel' },
        { name: 'Fette & Öle', description: '0,4 kg für 10 Tage pro Person.', requiredKeys: ['fette', 'öle', 'öl'], requiredAmount: 0.4, unit: 'kg', perPerson: true, consumable: true, groupName: 'Lebensmittel' },

        // Hygiene
        { name: 'Seife', description: 'Handseife und Körperseife für die tägliche Körperpflege.', requiredKeys: ['seife', 'handseife'], requiredAmount: 2, unit: 'Stück', perPerson: true, consumable: false, groupName: 'Hygiene' },
        { name: 'Zahnbürste', description: 'Zahnbürste für die tägliche Zahnpflege.', requiredKeys: ['zahnbürste'], requiredAmount: 1, unit: 'Stück', perPerson: true, consumable: false, groupName: 'Hygiene' },
        { name: 'Zahnpasta', description: 'Zahnpasta für die tägliche Zahnpflege.', requiredKeys: ['zahnpasta'], requiredAmount: 1, unit: 'Tube', perPerson: true, consumable: false, groupName: 'Hygiene' },
        { name: 'Toilettenpapier', description: 'Toilettenpapier für die tägliche Hygiene.', requiredKeys: ['toilettenpapier', 'klopapier'], requiredAmount: 4, unit: 'Rollen', perPerson: true, consumable: false, groupName: 'Hygiene' },

        // Hausapotheke
        { name: 'Schmerzmittel', description: 'Schmerzmittel für verschiedene Beschwerden.', requiredKeys: ['schmerzmittel', 'aspirin', 'ibuprofen'], requiredAmount: 1, unit: 'Packung', perPerson: false, consumable: false, groupName: 'Hausapotheke' },
        { name: 'Pflaster', description: 'Verschiedene Pflaster für kleine Wunden.', requiredKeys: ['pflaster'], requiredAmount: 1, unit: 'Packung', perPerson: false, consumable: false, groupName: 'Hausapotheke' },
        { name: 'Verband', description: 'Verbandsmaterial für größere Wunden.', requiredKeys: ['verband', 'verbandsmaterial'], requiredAmount: 3, unit: 'Stück', perPerson: false, consumable: false, groupName: 'Hausapotheke' },
        { name: 'Desinfektionsmittel', description: 'Desinfektionsmittel für Wunden und Hände.', requiredKeys: ['desinfektionsmittel'], requiredAmount: 1, unit: 'Flasche', perPerson: false, consumable: false, groupName: 'Hausapotheke' },

        // Energieausfall
        { name: 'Taschenlampe', description: 'Batteriegetriebene Taschenlampe für Beleuchtung.', requiredKeys: ['taschenlampe'], requiredAmount: 2, unit: 'Stück', perPerson: false, consumable: false, groupName: 'Energieausfall' },
        { name: 'Kerzen', description: 'Kerzen als alternative Lichtquelle.', requiredKeys: ['kerzen'], requiredAmount: 10, unit: 'Stück', perPerson: false, consumable: false, groupName: 'Energieausfall' },
        { name: 'Streichhölzer', description: 'Streichhölzer zum Anzünden von Kerzen.', requiredKeys: ['streichhölzer'], requiredAmount: 3, unit: 'Schachteln', perPerson: false, consumable: false, groupName: 'Energieausfall' },
        { name: 'Batterien', description: 'Verschiedene Batterien für Geräte.', requiredKeys: ['batterien'], requiredAmount: 20, unit: 'Stück', perPerson: false, consumable: false, groupName: 'Energieausfall' },

        // Brandschutz
        { name: 'Feuerlöscher', description: 'Feuerlöscher für den Hausgebrauch.', requiredKeys: ['feuerlöscher'], requiredAmount: 1, unit: 'Stück', perPerson: false, consumable: false, groupName: 'Brandschutz' },
        { name: 'Rauchmelder', description: 'Rauchmelder für frühzeitige Branderkennung.', requiredKeys: ['rauchmelder'], requiredAmount: 1, unit: 'Stück pro Raum', perPerson: false, consumable: false, groupName: 'Brandschutz' },

        // Dokumentensicherung
        { name: 'Personalausweis Kopie', description: 'Kopie des Personalausweises.', requiredKeys: ['personalausweis'], requiredAmount: 1, unit: 'Kopie', perPerson: true, consumable: false, groupName: 'Dokumentensicherung' },
        { name: 'Versicherungsdokumente', description: 'Wichtige Versicherungsdokumente.', requiredKeys: ['versicherung'], requiredAmount: 1, unit: 'Satz', perPerson: false, consumable: false, groupName: 'Dokumentensicherung' },

        // Notgepäck
        { name: 'Rucksack', description: 'Robuster Rucksack für Notfallausrüstung.', requiredKeys: ['rucksack'], requiredAmount: 1, unit: 'Stück', perPerson: true, consumable: false, groupName: 'Notgepäck' },
        { name: 'Wechselkleidung', description: 'Wechselkleidung für mehrere Tage.', requiredKeys: ['kleidung'], requiredAmount: 3, unit: 'Sätze', perPerson: true, consumable: false, groupName: 'Notgepäck' }
    ];

    const searchResults = useMemo(() => {
        if (!searchValue.trim()) return [];

        const query = searchValue.toLowerCase();
        const results: SearchResult[] = [];

        // Storage Items durchsuchen
        if (store.storeItems && Array.isArray(store.storeItems) && store.storeItems.length > 0) {
            const storageResults = store.storeItems
                .filter((item: StorageModel) =>
                    item && item.name && item.id && (
                        item.name.toLowerCase().includes(query) ||
                        (item.categories && Array.isArray(item.categories) && item.categories.some(cat => cat && cat.toLowerCase().includes(query)))
                    )
                )
                .slice(0, 5) // Limit auf 5 Ergebnisse
                .map((item: StorageModel) => ({
                    value: `storage-${item.id}`,
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                                src={item.icon || '/default.png'}
                                alt={item.name}
                                style={{ width: 20, height: 20, borderRadius: '50%' }}
                            />
                            <div>
                                <Text strong>{item.name}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {item.amount || 0} {item.unit || ''} • {t('search.labels.storageStock')}
                                </Text>
                            </div>
                        </div>
                    ),
                    type: 'storage' as const,
                    data: item
                }));
            results.push(...storageResults);
        }

        if (store.shoppingCard && Array.isArray(store.shoppingCard) && store.shoppingCard.length > 0) {
            // Einkaufswagen durchsuchen
            const shoppingResults = store.shoppingCard
                .filter((item: BasketModel) =>
                    item && item.name && item.id && (
                        item.name.toLowerCase().includes(query) ||
                        (item.categories && Array.isArray(item.categories) && item.categories.some(cat => cat && cat.toLowerCase().includes(query)))
                    )
                )
                .slice(0, 5) // Limit auf 5 Ergebnisse
                .map((item: BasketModel) => ({
                    value: `shopping-${item.id}`,
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                                src={item.icon || '/default.png'}
                                alt={item.name}
                                style={{ width: 20, height: 20, borderRadius: '50%' }}
                            />
                            <div>
                                <Text strong>{item.name}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {t('search.labels.cart')}
                                </Text>
                            </div>
                        </div>
                    ),
                    type: 'shopping' as const,
                    data: item
                }));
            results.push(...shoppingResults);
        }

        // Emergency-Kategorien durchsuchen
        const emergencyResults = emergencyCategories
            .filter(category =>
                category.title.toLowerCase().includes(query) ||
                category.key.toLowerCase().includes(query)
            )
            .slice(0, 3)
            .map(category => ({
                value: `emergency-${category.key}`,
                label: (
                    <div>
                        <Text strong>{category.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{t('search.labels.emergency')}</Text>
                    </div>
                ),
                type: 'emergency' as const,
                data: category
            }));
        logger.log('Emergency search results:', emergencyResults);
        results.push(...emergencyResults);

        // Seiten durchsuchen
        const pageResults = pages
            .filter(page =>
                page.title.toLowerCase().includes(query) ||
                page.key.toLowerCase().includes(query)
            )
            .slice(0, 2)
            .map(page => ({
                value: `page-${page.key}`,
                label: (
                    <div>
                        <Text strong>{page.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{t('search.labels.page')}</Text>
                    </div>
                ),
                type: 'page' as const,
                data: page
            }));
        results.push(...pageResults);

        // Checklist-Items durchsuchen
        const checklistResults = checklistItems
            .filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.groupName.toLowerCase().includes(query) ||
                item.requiredKeys.some(key => key.toLowerCase().includes(query))
            )
            .slice(0, 4)
            .map(item => ({
                value: `checklist-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
                label: (
                    <div>
                        <Text strong>{item.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.groupName} • {t('search.labels.checklist')}
                        </Text>
                    </div>
                ),
                type: 'checklist' as const,
                data: item
            }));
        results.push(...checklistResults);

        return results;
    }, [searchValue, store.storeItems, store.shoppingCard]);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        // options werden automatisch durch useEffect aktualisiert
    };

    // Synchronisation von searchResults und options
    useEffect(() => {
        logger.log('Setting options from searchResults:', searchResults);
        setOptions(searchResults);
    }, [searchResults]);

    const handleSelect = (value: string) => {
        logger.log('handleSelect called with value:', value);
        logger.log('Current searchResults:', searchResults);
        logger.log('Current options:', options);

        // Suche sowohl in searchResults als auch in options als Fallback
        let selected = searchResults.find(item => item.value === value);
        if (!selected) {
            logger.warn('Not found in searchResults, searching in options...');
            const optionItem = options.find(item => typeof item === 'object' && 'value' in item && item.value === value);
            if (optionItem && typeof optionItem === 'object' && 'data' in optionItem) {
                selected = optionItem as SearchResult;
            }
        }

        logger.log('Selected search result:', selected);

        if (!selected || !selected.data) {
            logger.warn('GlobalSearch: Kein Item oder Daten für selected value gefunden:', value);
            logger.warn('Available values in searchResults:', searchResults.map(r => r.value));
            logger.warn('Available values in options:', options.map(o => typeof o === 'object' && 'value' in o ? o.value : 'invalid'));
            return;
        }

        try {
            switch (selected.type) {
                case 'storage': {
                    const storageItem = selected.data as StorageModel;
                    logger.log('Navigating to storage item:', storageItem);
                    if (storageItem && storageItem.id) {
                        navigate(itemIdRoute(storageItem.id));
                    } else {
                        logger.warn('GlobalSearch: StorageModel hat keine ID:', storageItem);
                        navigate(itemsRoute); // Fallback zur Items-Liste
                    }
                    break;
                }
                case 'emergency': {
                    const emergencyData = selected.data as EmergencyCategory;
                    logger.log('Navigating to emergency category:', emergencyData);
                    if (emergencyData && emergencyData.path) {
                        navigate(emergencyData.path);
                    } else {
                        logger.warn('GlobalSearch: EmergencyCategory hat keinen path:', emergencyData);
                        navigate('/'); // Fallback zur Hauptseite
                    }
                    break;
                }
                case 'page': {
                    const pageData = selected.data as Page;
                    if (pageData && pageData.path) {
                        navigate(pageData.path);
                    } else {
                        logger.warn('GlobalSearch: Page hat keinen path:', pageData);
                        navigate('/'); // Fallback zur Hauptseite
                    }
                    break;
                }
                case 'shopping': {
                    const basketItem = selected.data as BasketModel;
                    logger.log('Navigating to basket for item:', basketItem);
                    // Für Einkaufswagen navigieren wir immer zur basket-Seite
                    navigate(basketRoute);
                    break;
                }
                case 'checklist': {
                    const checklistItem = selected.data as ChecklistItem;
                    logger.log('Navigating to checklist for item:', checklistItem);
                    // Für Checklist-Items navigieren wir zur Checklist-Seite
                    navigate(checklistRoute);
                    break;
                }
                default: {
                    logger.warn('GlobalSearch: Unbekannter type:', selected.type);
                    navigate('/'); // Fallback zur Hauptseite
                    break;
                }
            }
        } catch (error) {
            logger.error('GlobalSearch: Fehler bei Navigation:', error, selected);
            navigate('/'); // Fallback zur Hauptseite
        }

        setSearchValue('');
        setOptions([]);
    };

    return (
        <AutoComplete
            style={{ width: '100%', maxWidth: 400 }}
            options={options}
            onSearch={handleSearch}
            onSelect={handleSelect}
            value={searchValue}
            notFoundContent={searchValue ? <Empty description={t('search.no_results')} /> : null}
        >
            <Input
                placeholder={t('search.placeholder')}
                prefix={<SearchOutlined />}
                allowClear
                style={{ borderRadius: 'var(--border-radius-md)' }}
            />
        </AutoComplete>
    );
};

export default GlobalSearch;
