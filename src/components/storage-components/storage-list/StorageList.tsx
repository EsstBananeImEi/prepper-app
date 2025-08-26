import { Button, Divider, Empty, Pagination, Select, Space, Tag, Checkbox, Tooltip, Input } from 'antd';
import React, { ReactElement, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CloseCircleOutlined, DownOutlined, UpOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDemensions } from '../../../hooks/StorageApi';
import { itemsApi, errorRoute, newItemRoute } from '../../../shared/Constants';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { StorageModel } from '../StorageModel';
import StorageCardItem from './storage-item/StorageCardItem';
import StorageListItem from './storage-item/StorageListItem';
import styles from './StorageList.module.css';
import { useStore } from '../../../store/Store';

export default function StorageList(): ReactElement {
    // Statt useStorageApi holen wir die Items direkt aus dem Store:
    const { store, dispatch } = useStore();
    const history = useNavigate();
    const [sortField, setSortField] = useState<string>('name');

    // State für Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Standard Page Size
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(pageSize);

    // State für die Dropdown-Filter
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [onlyZero, setOnlyZero] = useState<boolean>(false);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [stockStatus, setStockStatus] = useState<string[]>([]); // 'low'|'mid'|'high'
    const [searchText, setSearchText] = useState<string>('');

    // Toggle-Status für den Filtercontainer
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const handleChange = (page: number) => {
        setCurrentPage(page);
    };
    const [dimensions] = useDemensions(handleChange, currentPage);

    // Stabiler Callback für StorageSearchItem um Re-Render Probleme zu vermeiden
    const dispatchRef = useRef(dispatch);
    dispatchRef.current = dispatch;

    const handleSearchCallback = useCallback((items: StorageModel[]) => {
        dispatchRef.current({ type: 'INITIAL_STORAGE', storageItems: items });
    }, []); // Leere Dependencies da wir Ref verwenden


    // Aktualisiere pageSize basierend auf der Bildschirmbreite
    useEffect(() => {
        if (dimensions.width > 1200) {
            setPageSize(30);
        } else if (dimensions.width > 800) {
            setPageSize(15);
        } else {
            setPageSize(20);
        }
        // Bei Änderung der Bildschirmbreite wieder auf Seite 1 springen
        setCurrentPage(1);
    }, [dimensions.width]);

    // Aktualisiere minValue und maxValue, wenn currentPage oder pageSize sich ändern
    useEffect(() => {
        setMaxValue(currentPage * pageSize);
        setMinValue((currentPage - 1) * pageSize);
    }, [currentPage, pageSize]);

    // Da die Items jetzt im Store verwaltet werden, verwenden wir diese mit useMemo:
    const safeStorageItems = useMemo(() => store.storeItems ?? [], [store.storeItems]);

    // Erzeuge Filteroptionen basierend auf den im Store vorhandenen Items
    const categoryOptions = useMemo(
        () => Array.from(new Set(safeStorageItems.flatMap((item) => item.categories || []))),
        [safeStorageItems]
    );
    const locationOptions = useMemo(
        () => Array.from(new Set(safeStorageItems.map((item) => item.storageLocation))),
        [safeStorageItems]
    );
    const unitOptions = useMemo(
        () => Array.from(new Set(safeStorageItems.map((item) => item.unit).filter(Boolean))),
        [safeStorageItems]
    );

    const getStockStatus = (item: StorageModel): 'zero' | 'low' | 'mid' | 'high' => {
        if (item.amount === 0) return 'zero';
        if (item.amount <= item.lowestAmount) return 'low';
        if (item.amount <= item.midAmount) return 'mid';
        return 'high';
    };

    const filteredItems = useMemo(() => {
        const text = searchText.trim().toLowerCase();
        return safeStorageItems.filter((item) => {
            if (text && !item.name.toLowerCase().includes(text)) return false;
            if (selectedCategories.length > 0) {
                const hasAny = (item.categories || []).some(c => selectedCategories.includes(c));
                if (!hasAny) return false;
            }
            if (selectedLocations.length > 0 && !selectedLocations.includes(item.storageLocation)) {
                return false;
            }
            if (selectedUnits.length > 0 && !selectedUnits.includes(item.unit)) {
                return false;
            }
            if (onlyZero && item.amount !== 0) {
                return false;
            }
            if (!onlyZero && stockStatus.length > 0) {
                const status = getStockStatus(item);
                if (!stockStatus.includes(status)) return false;
            }
            return true;
        });
    }, [safeStorageItems, searchText, selectedCategories, selectedLocations, selectedUnits, onlyZero, stockStatus]);

    const sortedItems = useMemo(() => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        return [...filteredItems].sort((a, b) => {
            let cmp = 0;
            switch (sortField) {
                case 'name':
                    cmp = a.name.localeCompare(b.name);
                    break;
                case 'storageLocation':
                    cmp = a.storageLocation.localeCompare(b.storageLocation);
                    break;
                case 'amount':
                    cmp = a.amount - b.amount;
                    break;
                case 'lastChanged':
                    cmp = new Date(a.lastChanged || 0).getTime() - new Date(b.lastChanged || 0).getTime();
                    break;
                default:
                    cmp = 0;
            }
            return cmp * factor;
        });
    }, [filteredItems, sortField, sortOrder]);

    const paginatedItems = useMemo(() => {
        return sortedItems.slice(minValue, maxValue);
    }, [sortedItems, minValue, maxValue]);



    const onGoToNew = () => history(newItemRoute);

    const activeFilterCount = selectedCategories.length + selectedLocations.length + selectedUnits.length + (onlyZero ? 1 : 0) + (stockStatus.length > 0 ? 1 : 0) + (searchText.trim() ? 1 : 0);

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedLocations([]);
        setOnlyZero(false);
        setSelectedUnits([]);
        setStockStatus([]);
        setSearchText('');
        setCurrentPage(1);
    };

    const removeCategory = (c: string) => {
        setSelectedCategories(prev => prev.filter(x => x !== c));
        setCurrentPage(1);
    };

    const removeLocation = (l: string) => {
        setSelectedLocations(prev => prev.filter(x => x !== l));
        setCurrentPage(1);
    };

    const removeUnit = (u: string) => {
        setSelectedUnits(prev => prev.filter(x => x !== u));
        setCurrentPage(1);
    };

    return (
        <>

            {/* Balken zum Öffnen/Schließen der Filter */}
            <div className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                <span>Filter & Sortierung{activeFilterCount > 0 ? ` (${activeFilterCount} aktiv)` : ''}</span>
                {showFilters ? (
                    <UpOutlined style={{ fontSize: 18, color: "#666" }} />
                ) : (
                    <DownOutlined style={{ fontSize: 18, color: "#666" }} />
                )}
            </div>

            {showFilters && (
                <div className={styles.filterBar}>
                    <div className={styles.filtersGrid}>
                        <div>
                            <div className={styles.label}>Suchen</div>
                            <Input
                                placeholder="Name suchen"
                                value={searchText}
                                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                                prefix={<SearchOutlined />}
                            />
                        </div>
                        <div>
                            <div className={styles.label}>Kategorien</div>
                            <Select
                                mode="multiple"
                                className={`${styles.dropdown} ${styles.mySelect}`}
                                placeholder="Kategorien wählen"
                                value={selectedCategories}
                                onChange={(vals: string[]) => { setSelectedCategories(vals); setCurrentPage(1); }}
                                allowClear
                                maxTagCount="responsive"
                                suffixIcon={<DownOutlined />}
                                clearIcon={<CloseCircleOutlined />}
                            >
                                {categoryOptions.map((category) => (
                                    <Select.Option key={category} value={category}>
                                        {category}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <div className={styles.label}>Lagerorte</div>
                            <Select
                                mode="multiple"
                                className={`${styles.dropdown} ${styles.mySelect}`}
                                placeholder="Lagerorte wählen"
                                value={selectedLocations}
                                onChange={(vals: string[]) => { setSelectedLocations(vals); setCurrentPage(1); }}
                                allowClear
                                maxTagCount="responsive"
                                suffixIcon={<DownOutlined />}
                                clearIcon={<CloseCircleOutlined />}
                            >
                                {locationOptions.map((location) => (
                                    <Select.Option key={location} value={location}>
                                        {location}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <div className={styles.label}>Einheiten</div>
                            <Select
                                mode="multiple"
                                className={`${styles.dropdown} ${styles.mySelect}`}
                                placeholder="Einheiten wählen"
                                value={selectedUnits}
                                onChange={(vals: string[]) => { setSelectedUnits(vals); setCurrentPage(1); }}
                                allowClear
                                maxTagCount="responsive"
                                suffixIcon={<DownOutlined />}
                                clearIcon={<CloseCircleOutlined />}
                            >
                                {unitOptions.map((u) => (
                                    <Select.Option key={u} value={u}>
                                        {u}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div className={styles.sortControls}>
                            <div className={styles.label}>Sortieren</div>
                            <div className={styles.sortRow}>
                                <Select
                                    className={styles.dropdown}
                                    placeholder="Feld wählen"
                                    value={sortField}
                                    onChange={(value: string) => { setSortField(value); setCurrentPage(1); }}
                                    suffixIcon={<DownOutlined style={{ fontSize: 18, color: "#666" }} />}
                                >
                                    <Select.Option key="name" value="name">Name</Select.Option>
                                    <Select.Option key="storageLocation" value="storageLocation">Lagerort</Select.Option>
                                    <Select.Option key="amount" value="amount">Menge</Select.Option>
                                    <Select.Option key="lastChanged" value="lastChanged">Zuletzt geändert</Select.Option>
                                </Select>
                                <Tooltip title={sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}>
                                    <Button
                                        aria-label="Sortierreihenfolge wechseln"
                                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                        className={styles.orderButton}
                                    >
                                        {sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                        <div className={styles.moreFilters}>
                            <div className={styles.label}>Bestand</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Checkbox checked={onlyZero} onChange={(e) => { setOnlyZero(e.target.checked); setCurrentPage(1); }}>
                                    Nur Bestand 0
                                </Checkbox>
                                <Checkbox.Group
                                    options={[
                                        { label: 'Kritisch', value: 'low' },
                                        { label: 'Wenig', value: 'mid' },
                                        { label: 'Ausreichend', value: 'high' },
                                    ]}
                                    value={stockStatus}
                                    onChange={(vals) => { setStockStatus(vals as string[]); setCurrentPage(1); }}
                                />
                            </div>
                        </div>
                    </div>

                    {(selectedCategories.length > 0 || selectedLocations.length > 0 || selectedUnits.length > 0 || onlyZero || stockStatus.length > 0 || searchText.trim()) && (
                        <div className={styles.chipsRow}>
                            {searchText.trim() && <Tag color="blue">Suche: {searchText.trim()}</Tag>}
                            {selectedCategories.map(c => (
                                <Tag key={`cat-${c}`} closable onClose={() => removeCategory(c)}>{c}</Tag>
                            ))}
                            {selectedLocations.map(l => (
                                <Tag key={`loc-${l}`} closable onClose={() => removeLocation(l)}>{l}</Tag>
                            ))}
                            {selectedUnits.map(u => (
                                <Tag key={`unit-${u}`} closable onClose={() => removeUnit(u)}>{u}</Tag>
                            ))}
                            {onlyZero && <Tag color="default">Bestand 0</Tag>}
                            {stockStatus.includes('low') && <Tag color="red">Kritisch</Tag>}
                            {stockStatus.includes('mid') && <Tag color="orange">Wenig</Tag>}
                            {stockStatus.includes('high') && <Tag color="green">Ausreichend</Tag>}
                            <Button size="small" onClick={clearFilters} className={styles.clearBtn}>Filter zurücksetzen</Button>
                        </div>
                    )}
                </div>
            )}

            {filteredItems.length <= 0 ? (
                <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{ height: 200 }}
                    description={<span style={{ color: 'red' }}>Keine Artikel vorhanden</span>}
                >
                    <Button onClick={onGoToNew} type="primary">
                        Artikel anlegen
                    </Button>
                </Empty>
            ) : (
                <div
                    className="space-align-container"
                    style={{
                        justifyContent: 'center',
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >
                    {dimensions.width > 450 ? (
                        <>
                            {paginatedItems.map((storageItem) => (
                                <div
                                    style={{ padding: '5px' }}
                                    key={`storage-item-${storageItem.id}`}
                                    className="space-align-block"
                                >
                                    <Space>
                                        <StorageCardItem storageItem={storageItem} />
                                    </Space>
                                </div>
                            ))}
                            {filteredItems.length !== 0 && (
                                <Pagination
                                    responsive
                                    pageSize={pageSize}
                                    current={currentPage}
                                    total={filteredItems.length}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        paddingTop: '10px'
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {paginatedItems.map((storageItem, index) => (
                                <div key={`div-${storageItem.id}`} style={{ width: '100%' }}>
                                    {index >= 0 && <Divider />}
                                    <StorageListItem storageItem={storageItem} />
                                    {index + 1 === filteredItems.length && <Divider />}
                                </div>
                            ))}
                            {filteredItems.length > pageSize && (
                                <Pagination
                                    responsive
                                    pageSize={pageSize}
                                    current={currentPage}
                                    total={filteredItems.length}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        paddingTop: '10px',
                                        marginTop: '30px',
                                        fontSize: '1.5rem'
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}
