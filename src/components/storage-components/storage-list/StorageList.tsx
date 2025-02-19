import { Button, Divider, Empty, Pagination, Select, Space } from 'antd';
import React, { ReactElement, useState, useEffect } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDemensions, useStorageApi } from '../../../hooks/StorageApi';
import { sortByName, itemsApi, errorRoute, newItemRoute } from '../../../shared/Constants';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import StorageSearchItem from '../storage-search-item/StorageSearchItem';
import { StorageModel } from '../StorageModel';
import StorageCardItem from './storage-item/StorageCardItem';
import StorageListItem from './storage-item/StorageListItem';
import styles from './StorageList.module.css';

export default function StorageList(): ReactElement {
    // Hole die Items via Custom Hook (hier: GET-Anfrage an itemsApi)
    const [storageItems, setStorageItems, axiosResponse] = useStorageApi<StorageModel[]>('get', itemsApi);
    const history = useNavigate();
    const [sortField, setSortField] = useState<string>('name');


    // State für Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);  // Standard Page size
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(pageSize);

    // State für die Dropdown-Filter
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    // Neu: Toggle-State für Filtercontainer
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const handleChange = (page: number) => {
        setCurrentPage(page);
    };

    const [dimensions] = useDemensions(handleChange, currentPage);

    // Effekt 1: Aktualisiere die pageSize basierend auf der Bildschirmbreite
    useEffect(() => {
        if (dimensions.width > 1200) {
            setPageSize(30);  // Mehr Artikel pro Seite auf großen Bildschirmen
        } else if (dimensions.width > 800) {
            setPageSize(15);  // Mittelgroße Bildschirme
        } else {
            setPageSize(20);  // Kleine Bildschirme
        }
        // Bei Änderung der pageSize auch wieder auf Seite 1 springen
        setCurrentPage(1);
    }, [dimensions.width]);

    // Effekt 2: Aktualisiere minValue und maxValue, wenn currentPage oder pageSize sich ändern
    useEffect(() => {
        setMaxValue(currentPage * pageSize);
        setMinValue((currentPage - 1) * pageSize);
    }, [currentPage, pageSize]);

    if (axiosResponse) {
        axiosResponse.catch((e) => {
            history(errorRoute(e.message));
        });
    }

    if (!storageItems) {
        return <LoadingSpinner message="Loading items..." />;
    }

    const onGoToNew = () => history(newItemRoute);

    // Berechne die möglichen Filteroptionen:
    // Für Kategorien: alle Kategorien aus allen Items (flatMap, da categories ein Array ist)
    const categoryOptions = Array.from(
        new Set(storageItems.flatMap(item => item.categories || []))
    );
    // Für StorageLocation: alle unterschiedlichen Storage-Locations
    const locationOptions = Array.from(
        new Set(storageItems.map(item => item.storageLocation))
    );

    // Filtere die Items anhand der ausgewählten Filter
    const filteredItems = storageItems.filter(item => {
        let match = true;
        if (selectedCategory) {
            // Prüfe, ob die ausgewählte Kategorie in den Kategorien des Items enthalten ist
            match = match && (item.categories ? item.categories.includes(selectedCategory) : false);
        }
        if (selectedLocation) {
            match = match && (item.storageLocation === selectedLocation);
        }
        return match;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
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

    // Paginierung der gefilterten Items
    const paginatedItems = sortedItems.slice(minValue, maxValue);

    return (
        <>
            {/* Suchfeld */}
            <StorageSearchItem callback={setStorageItems} />

            {/* Balken für Filter öffnen/schließen */}
            <div className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                <span>Filter & Sortierung</span>
                {showFilters ? <UpOutlined /> : <DownOutlined />}
            </div>

            {showFilters && (
                <div className={styles.filterSortContainer}>
                    <div className={styles.filterColumn}>
                        <Select
                            className={styles.dropdown}
                            placeholder="Filter by Category"
                            value={selectedCategory || undefined}
                            onChange={(value: string) => {
                                setSelectedCategory(value);
                                setCurrentPage(1);
                            }}
                            allowClear
                        >
                            {categoryOptions.map(category => (
                                <Select.Option key={category} value={category}>
                                    {category}
                                </Select.Option>
                            ))}
                        </Select>

                        <Select
                            className={styles.dropdown}
                            placeholder="Filter by Storage Location"
                            value={selectedLocation || undefined}
                            onChange={(value: string) => {
                                setSelectedLocation(value);
                                setCurrentPage(1);
                            }}
                            allowClear
                        >
                            {locationOptions.map(location => (
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
                        >
                            <Select.Option key="name" value="name">Name</Select.Option>
                            <Select.Option key="storageLocation" value="storageLocation">Storage Location</Select.Option>
                            <Select.Option key="amount" value="amount">Amount</Select.Option>
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
                    className={`space-align-container`}
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
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
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
                            {/* Pagination auch für die mobile Ansicht anzeigen */}
                            {filteredItems.length !== 0 && (
                                <Pagination
                                    responsive
                                    pageSize={pageSize}
                                    current={currentPage}
                                    total={filteredItems.length}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
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
