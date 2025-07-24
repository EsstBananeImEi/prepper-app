import { Button, Divider, Empty, Pagination, Select, Space } from 'antd';
import React, { ReactElement, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CloseCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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

    const filteredItems = useMemo(() => {
        return safeStorageItems.filter((item) => {
            let match = true;
            if (selectedCategory) {
                match = match && (item.categories ? item.categories.includes(selectedCategory) : false);
            }
            if (selectedLocation) {
                match = match && item.storageLocation === selectedLocation;
            }
            return match;
        });
    }, [safeStorageItems, selectedCategory, selectedLocation]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            switch (sortField) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'storageLocation':
                    return a.storageLocation.localeCompare(b.storageLocation);
                case 'amount':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });
    }, [filteredItems, sortField]);

    const paginatedItems = useMemo(() => {
        return sortedItems.slice(minValue, maxValue);
    }, [sortedItems, minValue, maxValue]);



    const onGoToNew = () => history(newItemRoute);

    return (
        <>

            {/* Balken zum Öffnen/Schließen der Filter */}
            <div className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                <span>Filter & Sortierung</span>
                {showFilters ? (
                    <UpOutlined style={{ fontSize: 18, color: "#666" }} />
                ) : (
                    <DownOutlined style={{ fontSize: 18, color: "#666" }} />
                )}
            </div>

            {showFilters && (
                <div className={styles.filterSortContainer}>

                    <div className={styles.filterColumn}>
                        <Select
                            className={`${styles.dropdown} ${styles.mySelect}`}
                            placeholder="Filter by Category"
                            value={selectedCategory || null}
                            onChange={(value: string) => {
                                setSelectedCategory(value || null);
                                setCurrentPage(1);
                            }}
                            allowClear
                            suffixIcon={<DownOutlined />}
                            clearIcon={<CloseCircleOutlined />}
                        >
                            {categoryOptions.map((category) => (
                                <Select.Option key={category} value={category}>
                                    {category}
                                </Select.Option>
                            ))}
                        </Select>

                        <Select
                            className={`${styles.dropdown} ${styles.mySelect}`}
                            placeholder="Filter by Storage Location"
                            value={selectedLocation || null}
                            onChange={(value: string) => {
                                setSelectedLocation(value || null);
                                setCurrentPage(1);
                            }}
                            allowClear
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

                    {/* Sort-Dropdown */}
                    <div className={styles.sortColumn}>
                        <Select
                            className={styles.dropdown}
                            placeholder="Sort by"
                            value={sortField}
                            onChange={(value: string) => {
                                setSortField(value);
                                setCurrentPage(1);
                            }}
                            allowClear
                            suffixIcon={<DownOutlined style={{ fontSize: 18, color: "#666" }} />}
                        >
                            <Select.Option key="name" value="name">
                                Name
                            </Select.Option>
                            <Select.Option key="storageLocation" value="storageLocation">
                                Storage Location
                            </Select.Option>
                            <Select.Option key="amount" value="amount">
                                Amount
                            </Select.Option>
                        </Select>
                    </div>
                </div>
            )}

            {filteredItems.length <= 0 ? (
                <Empty
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                    imageStyle={{ height: 200 }}
                    description={<span style={{ color: 'red' }}>No items in stock</span>}
                >
                    <Button onClick={onGoToNew} type="primary">
                        Store item
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
