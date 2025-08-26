import { Button, Divider, Empty, Pagination, Select, Space, Tag, Checkbox, Tooltip, Input, Drawer } from 'antd';
import React, { ReactElement, useState, useEffect, useMemo, useRef } from 'react';
import { CloseCircleOutlined, DownOutlined, UpOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDemensions } from '../../../hooks/StorageApi';
import { newItemRoute } from '../../../shared/Constants';
import { StorageModel } from '../StorageModel';
import StorageCardItem from './storage-item/StorageCardItem';
import StorageListItem from './storage-item/StorageListItem';
import styles from './StorageList.module.css';
import { useStore } from '../../../store/Store';

export default function StorageList(): ReactElement {
    const { store } = useStore();
    const history = useNavigate();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const handleChange = (page: number) => setCurrentPage(page);
    const [dimensions] = useDemensions(handleChange, currentPage);

    // Filters & sorting
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
    const [onlyZero, setOnlyZero] = useState<boolean>(false);
    const [stockStatus, setStockStatus] = useState<string[]>([]); // 'low'|'mid'|'high'
    const [searchText, setSearchText] = useState<string>('');
    const [sortField, setSortField] = useState<'name' | 'storageLocation' | 'amount' | 'lastChanged'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Drawer state
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [drawerHeight, setDrawerHeight] = useState<number>(380);
    const drawerContentRef = useRef<HTMLDivElement | null>(null);

    // Load filters from session
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('storageFilters');
            if (raw) {
                const f = JSON.parse(raw);
                setSelectedCategories(Array.isArray(f.selectedCategories) ? f.selectedCategories : []);
                setSelectedLocations(Array.isArray(f.selectedLocations) ? f.selectedLocations : []);
                setSelectedUnits(Array.isArray(f.selectedUnits) ? f.selectedUnits : []);
                setOnlyZero(!!f.onlyZero);
                setStockStatus(Array.isArray(f.stockStatus) ? f.stockStatus : []);
                setSearchText(typeof f.searchText === 'string' ? f.searchText : '');
                if (['name', 'storageLocation', 'amount', 'lastChanged'].includes(f.sortField)) {
                    setSortField(f.sortField);
                }
                if (['asc', 'desc'].includes(f.sortOrder)) {
                    setSortOrder(f.sortOrder);
                }
            }
        } catch {
            // ignore
        }
    }, []);

    // Save filters to session
    useEffect(() => {
        const payload = {
            selectedCategories,
            selectedLocations,
            selectedUnits,
            onlyZero,
            stockStatus,
            searchText,
            sortField,
            sortOrder,
        } as const;
        sessionStorage.setItem('storageFilters', JSON.stringify(payload));
        // compute active count and broadcast to other components (e.g., breadcrumb)
        const isDefaultSortLocal = sortField === 'name' && sortOrder === 'asc';
        const activeCount =
            selectedCategories.length +
            selectedLocations.length +
            selectedUnits.length +
            (onlyZero ? 1 : 0) +
            stockStatus.length +
            (searchText.trim() ? 1 : 0) +
            (isDefaultSortLocal ? 0 : 1);
        try {
            window.dispatchEvent(new CustomEvent('storageFiltersChanged', { detail: { count: activeCount } }));
        } catch { /* noop */ }
    }, [selectedCategories, selectedLocations, selectedUnits, onlyZero, stockStatus, searchText, sortField, sortOrder]);

    // Open Drawer via breadcrumb button custom event
    useEffect(() => {
        const onOpen = () => setShowFilters(true);
        window.addEventListener('openStorageFilters', onOpen as EventListener);
        return () => window.removeEventListener('openStorageFilters', onOpen as EventListener);
    }, []);

    const items = store.storeItems || [];

    // Recalculate drawer height so the overlay floats and contains content safely
    useEffect(() => {
        if (!showFilters) return;
        const measure = () => {
            const contentEl = drawerContentRef.current;
            // find the corresponding elements in this drawer
            const contentRoot = contentEl?.closest('.ant-drawer-content') as HTMLElement | null;
            const headerEl = contentRoot?.querySelector('.ant-drawer-header') as HTMLElement | null;
            const drawerBodyEl = contentRoot?.querySelector('.ant-drawer-body') as HTMLElement | null;
            const headerH = headerEl ? headerEl.getBoundingClientRect().height : 56;
            const contentH = contentEl ? contentEl.scrollHeight : 320;
            const isPortrait = typeof window.matchMedia === 'function'
                ? window.matchMedia('(orientation: portrait)').matches
                : window.innerHeight >= window.innerWidth;
            const topGap = isPortrait ? 24 : 32; // give more room on mobile
            const bottomGap = isPortrait ? 16 : 24;
            const buffer = isPortrait ? 24 : 12; // make overlay a bit higher than content to avoid scrollbar
            const maxAllowed = Math.max(260, window.innerHeight - (topGap + bottomGap));
            const desiredRaw = headerH + contentH + buffer;
            // If content exceeds available height, we'll allow internal body scrolling (hidden scrollbar via CSS)
            const desired = Math.min(maxAllowed, desiredRaw);
            setDrawerHeight(desired);
            // Constrain body height on the Drawer body (not the inner content) and allow internal scroll
            if (drawerBodyEl) {
                const bodyMax = Math.max(120, desired - headerH - 8);
                drawerBodyEl.style.maxHeight = `${bodyMax}px`;
                const fitsWithoutScroll = desiredRaw <= maxAllowed;
                drawerBodyEl.style.overflowY = fitsWithoutScroll ? 'hidden' : 'auto';
            }
        };
        // measure after paint
        const id = window.setTimeout(measure, 0);
        window.addEventListener('resize', measure);
        return () => {
            window.clearTimeout(id);
            window.removeEventListener('resize', measure);
        };
    }, [showFilters, selectedCategories, selectedLocations, selectedUnits, onlyZero, stockStatus, searchText, sortField, sortOrder]);

    // Option lists
    const categoryOptions = useMemo(() => {
        const set = new Set<string>();
        items.forEach((i) => (i.categories || []).forEach((c) => c && set.add(c)));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [items]);

    const locationOptions = useMemo(() => {
        const set = new Set<string>();
        items.forEach((i) => i.storageLocation && set.add(i.storageLocation));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [items]);

    const unitOptions = useMemo(() => {
        const set = new Set<string>();
        items.forEach((i) => i.unit && set.add(i.unit));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [items]);

    // Helpers
    const statusOf = (it: StorageModel): 'low' | 'mid' | 'high' => {
        if (it.amount <= it.lowestAmount) return 'low';
        if (it.amount <= it.midAmount) return 'mid';
        return 'high';
    };

    const filteredItems = useMemo(() => {
        const term = searchText.trim().toLowerCase();
        let arr = items.slice();

        if (term) {
            arr = arr.filter((i) => i.name.toLowerCase().includes(term));
        }
        if (selectedCategories.length > 0) {
            arr = arr.filter((i) => {
                const cs = i.categories || [];
                return cs.some((c) => selectedCategories.includes(c));
            });
        }
        if (selectedLocations.length > 0) {
            arr = arr.filter((i) => selectedLocations.includes(i.storageLocation));
        }
        if (selectedUnits.length > 0) {
            arr = arr.filter((i) => selectedUnits.includes(i.unit));
        }
        if (onlyZero) {
            arr = arr.filter((i) => i.amount === 0);
        }
        if (stockStatus.length > 0) {
            arr = arr.filter((i) => stockStatus.includes(statusOf(i)));
        }

        arr.sort((a, b) => {
            let res = 0;
            switch (sortField) {
                case 'name':
                    res = a.name.localeCompare(b.name);
                    break;
                case 'storageLocation':
                    res = a.storageLocation.localeCompare(b.storageLocation);
                    break;
                case 'amount':
                    res = a.amount - b.amount;
                    break;
                case 'lastChanged': {
                    const ta = a.lastChanged ? Date.parse(a.lastChanged) : 0;
                    const tb = b.lastChanged ? Date.parse(b.lastChanged) : 0;
                    res = ta - tb;
                    break;
                }
                default:
                    res = 0;
            }
            return sortOrder === 'asc' ? res : -res;
        });

        return arr;
    }, [items, searchText, selectedCategories, selectedLocations, selectedUnits, onlyZero, stockStatus, sortField, sortOrder]);

    // Pagination slice
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage]);

    // Active filter count (include sort if not default)
    const isDefaultSort = sortField === 'name' && sortOrder === 'asc';
    const activeFilterCount =
        selectedCategories.length +
        selectedLocations.length +
        selectedUnits.length +
        (onlyZero ? 1 : 0) +
        stockStatus.length +
        (searchText.trim() ? 1 : 0) +
        (isDefaultSort ? 0 : 1);

    // Chip handlers
    const removeCategory = (c: string) => setSelectedCategories((prev) => prev.filter((x) => x !== c));
    const removeLocation = (l: string) => setSelectedLocations((prev) => prev.filter((x) => x !== l));
    const removeUnit = (u: string) => setSelectedUnits((prev) => prev.filter((x) => x !== u));
    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedLocations([]);
        setSelectedUnits([]);
        setOnlyZero(false);
        setStockStatus([]);
        setSearchText('');
        setCurrentPage(1);
        setSortField('name');
        setSortOrder('asc');
    };

    const resetSort = () => {
        setSortField('name');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    const sortFieldLabel = (f: 'name' | 'storageLocation' | 'amount' | 'lastChanged') => {
        switch (f) {
            case 'name': return 'Name';
            case 'storageLocation': return 'Lagerort';
            case 'amount': return 'Menge';
            case 'lastChanged': return 'Zuletzt geändert';
            default: return String(f);
        }
    };

    const onGoToNew = () => history(newItemRoute);

    return (
        <>
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Filter & Sortierung</span>
                        {activeFilterCount > 0 && <Tag color="processing">{activeFilterCount} aktiv</Tag>}
                    </div>
                }
                placement="top"
                height={drawerHeight}
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                destroyOnClose={false}
                closable
                className={styles.filterDrawer}
                bodyStyle={{ overflow: 'hidden' }}
            >
                <div ref={drawerContentRef} className={styles.filterBar}>
                    <div className={styles.filtersGrid}>
                        <div>
                            <div className={styles.label}>Suchen</div>
                            <Input
                                placeholder="Name suchen"
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                                onChange={(vals: string[]) => {
                                    setSelectedCategories(vals);
                                    setCurrentPage(1);
                                }}
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
                                onChange={(vals: string[]) => {
                                    setSelectedLocations(vals);
                                    setCurrentPage(1);
                                }}
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
                                onChange={(vals: string[]) => {
                                    setSelectedUnits(vals);
                                    setCurrentPage(1);
                                }}
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
                                    onChange={(value) => {
                                        setSortField(value as 'name' | 'storageLocation' | 'amount' | 'lastChanged');
                                        setCurrentPage(1);
                                    }}
                                    suffixIcon={<DownOutlined style={{ fontSize: 18, color: '#666' }} />}
                                >
                                    <Select.Option key="name" value="name">Name</Select.Option>
                                    <Select.Option key="storageLocation" value="storageLocation">Lagerort</Select.Option>
                                    <Select.Option key="amount" value="amount">Menge</Select.Option>
                                    <Select.Option key="lastChanged" value="lastChanged">Zuletzt geändert</Select.Option>
                                </Select>
                                <Tooltip title={sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}>
                                    <Button
                                        aria-label="Sortierreihenfolge wechseln"
                                        onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
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
                                <Checkbox
                                    checked={onlyZero}
                                    onChange={(e) => {
                                        setOnlyZero(e.target.checked);
                                        setCurrentPage(1);
                                    }}
                                >
                                    Nur Bestand 0
                                </Checkbox>
                                <Checkbox.Group
                                    options={[
                                        { label: 'Kritisch', value: 'low' },
                                        { label: 'Wenig', value: 'mid' },
                                        { label: 'Ausreichend', value: 'high' },
                                    ]}
                                    value={stockStatus}
                                    onChange={(vals) => {
                                        setStockStatus(vals as string[]);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {(selectedCategories.length > 0 ||
                        selectedLocations.length > 0 ||
                        selectedUnits.length > 0 ||
                        onlyZero ||
                        stockStatus.length > 0 ||
                        searchText.trim() ||
                        !isDefaultSort) && (
                            <div className={styles.chipsRow}>
                                {searchText.trim() && <Tag color="blue">Suche: {searchText.trim()}</Tag>}
                                {selectedCategories.map((c) => (
                                    <Tag key={`cat-${c}`} closable onClose={() => removeCategory(c)}>
                                        {c}
                                    </Tag>
                                ))}
                                {selectedLocations.map((l) => (
                                    <Tag key={`loc-${l}`} closable onClose={() => removeLocation(l)}>
                                        {l}
                                    </Tag>
                                ))}
                                {selectedUnits.map((u) => (
                                    <Tag key={`unit-${u}`} closable onClose={() => removeUnit(u)}>
                                        {u}
                                    </Tag>
                                ))}
                                {onlyZero && <Tag color="default">Bestand 0</Tag>}
                                {stockStatus.includes('low') && <Tag color="red">Kritisch</Tag>}
                                {stockStatus.includes('mid') && <Tag color="orange">Wenig</Tag>}
                                {stockStatus.includes('high') && <Tag color="green">Ausreichend</Tag>}
                                {!isDefaultSort && (
                                    <Tag
                                        color="geekblue"
                                        closable
                                        onClose={resetSort}
                                    >
                                        {`Sortierung: ${sortFieldLabel(sortField)} ${sortOrder === 'asc' ? '↑' : '↓'}`}
                                    </Tag>
                                )}
                                <Button size="small" onClick={clearFilters} className={styles.clearBtn}>
                                    Filter zurücksetzen
                                </Button>
                            </div>
                        )}
                </div>
            </Drawer>

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
                        flexWrap: 'wrap',
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
                                    {index + 1 === paginatedItems.length && <Divider />}
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
                                        fontSize: '1.5rem',
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
