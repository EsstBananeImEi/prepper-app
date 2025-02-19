import { Pagination, Select } from 'antd'
import React, { ReactElement, useMemo, useState } from 'react'
import { Message } from 'semantic-ui-react'
import { useDemensions } from '../../../hooks/StorageApi'
import { useStore } from '../../../store/Store'
import { BasketModel, StorageModel } from '../StorageModel'
import ShoppingCard from './ShoppingCard'
import ShoppingList from './ShoppingList'
import styles from '../storage-list/StorageList.module.css'
import { CloseCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

export default function Shopping(): ReactElement {
    const { store, dispatch } = useStore()

    const handleChange = (page: number) => {
        setCurrentPage(page)
        setMinValue(currentVal => (page - 1) * pageSize)
        setMaxValue(currentVal => page * pageSize)
    }
    const [currentPage, setCurrentPage] = useState(1)
    const [dimensions] = useDemensions(handleChange, currentPage)
    const [minValue, setMinValue] = useState(0)
    const [maxValue, setMaxValue] = useState(Math.floor(Math.floor(dimensions.height - 128) / 155) * Math.floor(Math.floor(dimensions.width - 20) / 310))
    const pageSize = Math.floor(Math.floor(dimensions.height - 128) / 155) * Math.floor(Math.floor(dimensions.width - 20) / 310)
    const paginationValues = { minValue, maxValue }
    const storedItems = store.shoppingCard.reduce((acc: BasketModel[], storageItem) => {
        if (!acc.find(item => item.name === storageItem.name)) {
            acc.push(storageItem)
        }
        return acc
    }, [])
        .sort((a, b) => Number(a.id) - Number(b.id))

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [sortField, setSortField] = useState<string>('name')

    // Toggle-Status für den Filtercontainer
    const [showFilters, setShowFilters] = useState<boolean>(false)
    const categoryOptions = useMemo(
        () => Array.from(new Set(storedItems.flatMap(item => item.categories || []))),
        [storedItems]
    )

    const filteredItems = useMemo(() => {
        return storedItems.filter(item => {
            let match = true
            if (selectedCategory) {
                match = match && (item.categories ? item.categories.includes(selectedCategory) : false)
            }
            return match
        })
    }, [storedItems, selectedCategory])

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            switch (sortField) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category': {
                    const aCat =
                        a.categories && a.categories.length > 0 ? a.categories[0] : '';
                    const bCat =
                        b.categories && b.categories.length > 0 ? b.categories[0] : '';
                    return aCat.localeCompare(bCat);
                }
                default:
                    return 0;
            }
        });
    }, [filteredItems, sortField]);


    return (
        <>
            <div className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
                <span>Filter & Sortierung</span>
                {showFilters ? <UpOutlined style={{ fontSize: 18, color: "#666" }} /> : <DownOutlined style={{ fontSize: 18, color: "#666" }} />}
            </div>

            {showFilters && (
                <div className={styles.filterSortContainer}>
                    <div className={styles.filterColumn}>
                        <Select
                            className={styles.dropdown}
                            placeholder="Filter by Category"
                            value={selectedCategory || undefined}
                            onChange={(value: string) => {
                                setSelectedCategory(value || null)
                                setCurrentPage(1)
                            }}
                            allowClear
                            suffixIcon={<DownOutlined style={{ fontSize: 18, color: "#666" }} />} // Größerer Pfeil
                            clearIcon={<CloseCircleOutlined style={{ fontSize: 20, color: "red" }} />} // Größeres X
                        >
                            {categoryOptions.map(category => (
                                <Select.Option key={category} value={category}>
                                    {category}
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
                                setSortField(value)
                                setCurrentPage(1)
                            }}
                            suffixIcon={<DownOutlined style={{ fontSize: 18, color: "#666" }} />} // Größerer Pfeil
                            clearIcon={<CloseCircleOutlined style={{ fontSize: 20, color: "red" }} />} // Größeres X
                        >
                            <Select.Option key="name" value="name">
                                Name
                            </Select.Option>
                            <Select.Option key="category" value="category">
                                Category
                            </Select.Option>
                        </Select>
                    </div>
                </div>
            )}

            {store.shoppingCard.length <= 0 && (
                <Message className='blue'
                    icon='shopping cart'
                    header='Der Einkaufswagen ist leer!'
                    content='Scheint als brauchst du derzeit nichts'
                />
            )}

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
                        <ShoppingCard storedItems={storedItems} dimensions={dimensions} pagination={paginationValues} />
                        {storedItems.length !== 0 && (
                            <Pagination responsive
                                pageSize={pageSize}
                                current={currentPage}
                                total={storedItems.length}
                                onChange={handleChange}
                                style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: '10px' }}
                            />
                        )}
                    </>
                ) : (
                    <ShoppingList
                        storedItems={sortedItems}
                        dimensions={dimensions}
                        key="list"
                        groupByCategory={sortField === 'category'}
                    />
                )}
            </div>
        </>
    )
}
