import { Button, Drawer, Input, Pagination, Select, Tag, Tooltip } from 'antd'
import React, { ReactElement, useMemo, useRef, useState, useEffect } from 'react'
import { Message } from 'semantic-ui-react'
import { useDemensions } from '../../../hooks/StorageApi'
import { useStore } from '../../../store/Store'
import { BasketModel, StorageModel } from '../StorageModel'
import ShoppingCard from './ShoppingCard'
import ShoppingList from './ShoppingList'
import styles from '../storage-list/StorageList.module.css'
import { CloseCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

export default function Shopping(): ReactElement {
    const { store } = useStore()
    const [currentPage, setCurrentPage] = useState(1)
    const handleChange = (page: number) => setCurrentPage(page)
    const [dimensions] = useDemensions(handleChange, currentPage)
    const isPortrait = dimensions.height >= dimensions.width
    const isDesktop = !isPortrait && dimensions.width >= 1000
    const storedItems = store.shoppingCard.reduce((acc: BasketModel[], storageItem) => {
        if (!acc.find(item => item.name === storageItem.name)) {
            acc.push(storageItem)
        }
        return acc
    }, [])
        .sort((a, b) => Number(a.id) - Number(b.id))

    // Filters & sorting (aligned with item list, but tailored to shopping fields)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [searchText, setSearchText] = useState<string>('')
    const [sortField, setSortField] = useState<'name' | 'category'>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
    const [showFilters, setShowFilters] = useState<boolean>(false)
    const [drawerHeight, setDrawerHeight] = useState<number>(360)
    const drawerContentRef = useRef<HTMLDivElement | null>(null)

    // Load filters from session
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('shoppingFilters')
            if (raw) {
                const f = JSON.parse(raw)
                setSelectedCategories(Array.isArray(f.selectedCategories) ? f.selectedCategories : [])
                setSearchText(typeof f.searchText === 'string' ? f.searchText : '')
                if (['name', 'category'].includes(f.sortField)) setSortField(f.sortField)
                if (['asc', 'desc'].includes(f.sortOrder)) setSortOrder(f.sortOrder)
            }
        } catch { /* noop */ }
    }, [])

    // Save filters to session and broadcast active count (optional)
    useEffect(() => {
        const payload = { selectedCategories, searchText, sortField, sortOrder } as const
        sessionStorage.setItem('shoppingFilters', JSON.stringify(payload))
        const isDefaultSortLocal = sortField === 'name' && sortOrder === 'asc'
        const activeCount = selectedCategories.length + (searchText.trim() ? 1 : 0) + (isDefaultSortLocal ? 0 : 1)
        try { window.dispatchEvent(new CustomEvent('shoppingFiltersChanged', { detail: { count: activeCount } })) } catch { /* noop */ }
    }, [selectedCategories, searchText, sortField, sortOrder])

    // Measure Drawer height similar to StorageList
    useEffect(() => {
        if (!showFilters) return
        const measure = () => {
            const contentEl = drawerContentRef.current
            const contentRoot = contentEl?.closest('.ant-drawer-content') as HTMLElement | null
            const headerEl = contentRoot?.querySelector('.ant-drawer-header') as HTMLElement | null
            const drawerBodyEl = contentRoot?.querySelector('.ant-drawer-body') as HTMLElement | null
            const headerH = headerEl ? headerEl.getBoundingClientRect().height : 56
            const contentH = contentEl ? contentEl.scrollHeight : 320
            const topGap = isPortrait ? 24 : 32
            const bottomGap = isPortrait ? 16 : 24
            const buffer = isPortrait ? 24 : 12
            const maxAllowed = Math.max(260, window.innerHeight - (topGap + bottomGap))
            const desiredRaw = headerH + contentH + buffer
            const desired = Math.min(maxAllowed, desiredRaw)
            setDrawerHeight(desired)
            if (drawerBodyEl) {
                const bodyMax = Math.max(120, desired - headerH - 8)
                drawerBodyEl.style.maxHeight = `${bodyMax}px`
                const fitsWithoutScroll = desiredRaw <= maxAllowed
                drawerBodyEl.style.overflowY = fitsWithoutScroll ? 'hidden' : 'auto'
            }
        }
        const id = window.setTimeout(measure, 0)
        window.addEventListener('resize', measure)
        return () => { window.clearTimeout(id); window.removeEventListener('resize', measure) }
    }, [showFilters, selectedCategories, searchText, sortField, sortOrder, isPortrait])

    const filteredItems = useMemo(() => {
        const term = searchText.trim().toLowerCase()
        let arr = storedItems.slice()
        if (term) arr = arr.filter(i => i.name.toLowerCase().includes(term))
        if (selectedCategories.length > 0) {
            arr = arr.filter(i => (i.categories || []).some(c => selectedCategories.includes(c)))
        }
        arr.sort((a, b) => {
            let res = 0
            if (sortField === 'name') res = a.name.localeCompare(b.name)
            else {
                const ac = (a.categories && a.categories[0]) || ''
                const bc = (b.categories && b.categories[0]) || ''
                res = ac.localeCompare(bc)
            }
            return sortOrder === 'asc' ? res : -res
        })
        return arr
    }, [storedItems, searchText, selectedCategories, sortField, sortOrder])

    const sortedItems = filteredItems
    const categoryOptions = useMemo(
        () => Array.from(new Set(storedItems.flatMap(item => item.categories || []))).sort((a, b) => a.localeCompare(b)),
        [storedItems]
    )

    // Desktop dynamic pagination like item list
    const [pageSize, setPageSize] = useState(10)
    const itemsWrapperRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        if (!isDesktop) { if (pageSize !== 10) setPageSize(10); return }
        const measure = () => {
            const el = itemsWrapperRef.current; if (!el) return
            const rect = el.getBoundingClientRect()
            const availableHeight = Math.max(0, window.innerHeight - rect.top - 32)
            const availableWidth = el.clientWidth
            const sample = el.querySelector('.space-align-block') as HTMLElement | null
            let tileW = 210, tileH = 210
            if (sample) {
                const cs = window.getComputedStyle(sample)
                tileW = sample.offsetWidth + parseFloat(cs.marginLeft || '0') + parseFloat(cs.marginRight || '0')
                tileH = sample.offsetHeight + parseFloat(cs.marginTop || '0') + parseFloat(cs.marginBottom || '0')
            }
            const cols = Math.max(1, Math.floor(availableWidth / tileW))
            const rows = Math.max(1, Math.floor(availableHeight / tileH))
            const newSize = Math.max(1, rows * cols)
            if (newSize !== pageSize) setPageSize(newSize)
        }
        measure(); const t0 = window.setTimeout(measure, 0); const t1 = window.setTimeout(measure, 120); const raf = window.requestAnimationFrame(measure)
        const onLoad = () => measure()
        window.addEventListener('load', onLoad)
        window.addEventListener('resize', measure)
        return () => { window.clearTimeout(t0); window.clearTimeout(t1); window.cancelAnimationFrame(raf); window.removeEventListener('load', onLoad); window.removeEventListener('resize', measure) }
    }, [isDesktop])

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return sortedItems.slice(start, start + pageSize)
    }, [sortedItems, currentPage, pageSize])

    useEffect(() => {
        const total = sortedItems.length
        const maxPage = Math.max(1, Math.ceil(total / pageSize))
        if (currentPage > maxPage) setCurrentPage(maxPage)
    }, [pageSize, sortedItems.length])


    return (
        <>
            <div className={styles.filterToggle} onClick={() => setShowFilters(true)}>
                <span>Filter & Sortierung</span>
                {showFilters ? <UpOutlined style={{ fontSize: 18, color: '#666' }} /> : <DownOutlined style={{ fontSize: 18, color: '#666' }} />}
            </div>

            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Filter & Sortierung</span>
                        {(() => { const isDefault = sortField === 'name' && sortOrder === 'asc'; const count = selectedCategories.length + (searchText.trim() ? 1 : 0) + (isDefault ? 0 : 1); return count > 0 ? <Tag color="processing">{count} aktiv</Tag> : null })()}
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
                                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1) }}
                            />
                        </div>
                        <div>
                            <div className={styles.label}>Kategorien</div>
                            <Select
                                mode="multiple"
                                className={`${styles.dropdown} ${styles.mySelect}`}
                                placeholder="Kategorien wählen"
                                value={selectedCategories}
                                onChange={(vals: string[]) => { setSelectedCategories(vals); setCurrentPage(1) }}
                                allowClear
                                maxTagCount="responsive"
                                suffixIcon={<DownOutlined />}
                                clearIcon={<CloseCircleOutlined />}
                            >
                                {categoryOptions.map((category) => (
                                    <Select.Option key={category} value={category}>{category}</Select.Option>
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
                                    onChange={(value) => { setSortField(value as 'name' | 'category'); setCurrentPage(1) }}
                                    suffixIcon={<DownOutlined style={{ fontSize: 18, color: '#666' }} />}
                                >
                                    <Select.Option key="name" value="name">Name</Select.Option>
                                    <Select.Option key="category" value="category">Kategorie</Select.Option>
                                </Select>
                                <Tooltip title={sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}>
                                    <Button aria-label="Sortierreihenfolge wechseln" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className={styles.orderButton}>
                                        {sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {(selectedCategories.length > 0 || searchText.trim() || !(sortField === 'name' && sortOrder === 'asc')) && (
                        <div className={styles.chipsRow}>
                            {searchText.trim() && <Tag color="blue">Suche: {searchText.trim()}</Tag>}
                            {selectedCategories.map(c => (
                                <Tag key={`cat-${c}`} closable onClose={() => setSelectedCategories(prev => prev.filter(x => x !== c))}>{c}</Tag>
                            ))}
                            {!(sortField === 'name' && sortOrder === 'asc') && (
                                <Tag color="geekblue" closable onClose={() => { setSortField('name'); setSortOrder('asc') }}>Sortierung: {sortField === 'name' ? 'Name' : 'Kategorie'} {sortOrder === 'asc' ? '↑' : '↓'}</Tag>
                            )}
                            <Button size="small" onClick={() => { setSelectedCategories([]); setSearchText(''); setSortField('name'); setSortOrder('asc'); setCurrentPage(1) }} className={styles.clearBtn}>Filter zurücksetzen</Button>
                        </div>
                    )}
                </div>
            </Drawer>

            {store.shoppingCard.length <= 0 && (
                <Message className='blue'
                    icon='shopping cart'
                    header='Der Einkaufswagen ist leer!'
                    content='Scheint als brauchst du derzeit nichts'
                />
            )}

            <div
                className={`space-align-container ${styles.itemsWrapper}`}
                style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexWrap: 'wrap'
                }}
                ref={itemsWrapperRef}
            >
                {(dimensions.width > 450 && !(isPortrait && dimensions.width <= 600)) ? (
                    <>
                        <ShoppingCard storedItems={paginatedItems} dimensions={dimensions} />
                        {sortedItems.length !== 0 && (
                            <Pagination
                                pageSize={pageSize}
                                current={currentPage}
                                total={sortedItems.length}
                                onChange={handleChange}
                                size="default"
                                showLessItems={false}
                                className={styles.pagination}
                            />
                        )}
                    </>
                ) : (
                    <ShoppingList
                        storedItems={sortedItems}
                        dimensions={dimensions}
                        key="list"
                        groupByCategory={sortField === 'category'}
                        hideCategoryHeaders={false}
                        compact
                    />
                )}
            </div>
        </>
    )
}
