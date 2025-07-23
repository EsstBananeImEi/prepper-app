import React, { useState, useEffect, useMemo } from 'react';
import { Input, AutoComplete, Empty, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/Store';
import { StorageModel } from '../storage-components/StorageModel';

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

interface SearchResult {
    value: string;
    label: React.ReactNode;
    type: 'storage' | 'emergency' | 'page';
    data?: StorageModel | EmergencyCategory | Page;
}

const GlobalSearch: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState<SearchResult[]>([]);
    const { store } = useStore();
    const navigate = useNavigate();

    // Emergency/Notfall-Kategorien für die Suche
    const emergencyCategories = [
        { key: 'lebensmittel', title: 'Lebensmittelvorrat', path: '/details/lebensmittel' },
        { key: 'wasser', title: 'Trinkwasservorrat', path: '/details/wasser' },
        { key: 'medikamente', title: 'Medikamente & Erste-Hilfe', path: '/details/medikamente' },
        { key: 'hygiene', title: 'Hygiene & Desinfektion', path: '/details/hygiene' },
        { key: 'informieren', title: 'Notfallausrüstung & Kommunikation', path: '/details/informieren' },
        { key: 'dokumente', title: 'Wichtige Dokumente', path: '/details/dokumente' },
        { key: 'gepaeck', title: 'Notfallgepäck & Fluchtrucksack', path: '/details/gepaeck' },
        { key: 'sicherheit', title: 'Sicherheit im Haus', path: '/details/sicherheit' },
        { key: 'beduerfnisse', title: 'Spezielle Bedürfnisse', path: '/details/beduerfnisse' }
    ];

    // Seiten für die Suche
    const pages = [
        { key: 'storage', title: 'Lagerbestand', path: '/items' },
        { key: 'checklist', title: 'Checkliste', path: '/checklist' },
        { key: 'basket', title: 'Einkaufsliste', path: '/basket' },
        { key: 'add-item', title: 'Neues Item hinzufügen', path: '/items/new' }
    ];

    const searchResults = useMemo(() => {
        if (!searchValue.trim()) return [];

        const query = searchValue.toLowerCase();
        const results: SearchResult[] = [];

        // Storage Items durchsuchen
        if (store.storeItems) {
            const storageResults = store.storeItems
                .filter((item: StorageModel) =>
                    item.name.toLowerCase().includes(query) ||
                    (item.categories && item.categories.some(cat => cat.toLowerCase().includes(query)))
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
                                    {item.amount} {item.unit} • Lagerbestand
                                </Text>
                            </div>
                        </div>
                    ),
                    type: 'storage' as const,
                    data: item
                }));
            results.push(...storageResults);
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
                        <Text type="secondary" style={{ fontSize: 12 }}>Notfallvorsorge</Text>
                    </div>
                ),
                type: 'emergency' as const,
                data: category
            }));
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
                        <Text type="secondary" style={{ fontSize: 12 }}>Seite</Text>
                    </div>
                ),
                type: 'page' as const,
                data: page
            }));
        results.push(...pageResults);

        return results;
    }, [searchValue, store.storeItems]);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setOptions(searchResults);
    }; const handleSelect = (value: string) => {
        const selected = searchResults.find(item => item.value === value);
        if (!selected || !selected.data) return;

        switch (selected.type) {
            case 'storage': {
                const storageItem = selected.data as StorageModel;
                navigate(`/items/${storageItem.id}`);
                break;
            }
            case 'emergency': {
                const emergencyData = selected.data as EmergencyCategory;
                navigate(emergencyData.path);
                break;
            }
            case 'page': {
                const pageData = selected.data as Page;
                navigate(pageData.path);
                break;
            }
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
            notFoundContent={searchValue ? <Empty description="Keine Ergebnisse gefunden" /> : null}
        >
            <Input
                placeholder="Suche nach Items, Kategorien oder Seiten..."
                prefix={<SearchOutlined />}
                allowClear
                style={{ borderRadius: 'var(--border-radius-md)' }}
            />
        </AutoComplete>
    );
};

export default GlobalSearch;
