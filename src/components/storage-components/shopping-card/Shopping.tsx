import { Button, Drawer, Input, Pagination, Select, Tag, Tooltip, Divider, Modal, Form, InputNumber } from 'antd'
import React, { ReactElement, useMemo, useRef, useState, useEffect } from 'react'
import { Message } from 'semantic-ui-react'
import { useDemensions } from '../../../hooks/StorageApi'
import { useStore } from '../../../store/Store'
import { BasketModel, StorageModel } from '../StorageModel'
import ShoppingCard from './ShoppingCard'
import ShoppingList from './ShoppingList'
import styles from '../storage-list/StorageList.module.css'
import { CloseCircleOutlined, DownOutlined, UpOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next'
import { actionHandler } from '../../../store/Actions'
import { loadOptionsCache } from '../../../utils/optionsCache'

export default function Shopping(): ReactElement {
    const { t } = useTranslation()
    const { store, dispatch } = useStore()
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
    // Manual add modal
    const [showAddModal, setShowAddModal] = useState<boolean>(false)
    const [addForm] = Form.useForm<{ name: string; amount: number; category?: string | string[] }>()
    const [externalCategories, setExternalCategories] = useState<string[]>([])

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

    // Open Drawer via breadcrumb button custom event (align with StorageList)
    useEffect(() => {
        const onOpen = () => setShowFilters(true)
        window.addEventListener('openShoppingFilters', onOpen as EventListener)
        return () => window.removeEventListener('openShoppingFilters', onOpen as EventListener)
    }, [])

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
    // Helper: normalize & unique category list (case-insensitive, trimmed)
    const normalizeCategories = (arr: string[]): string[] => {
        const seen = new Map<string, string>();
        for (const raw of arr) {
            if (!raw) continue;
            const trimmed = String(raw).trim();
            if (!trimmed) continue;
            const key = trimmed.toLocaleLowerCase();
            if (!seen.has(key)) seen.set(key, trimmed);
        }
        return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
    };

    // Load categories from backend (options cache) on mount
    useEffect(() => {
        let mounted = true;
        loadOptionsCache()
            .then(data => {
                if (!mounted) return;
                const names = (data.categories || []).map(c => c.name).filter(Boolean) as string[];
                setExternalCategories(normalizeCategories(names));
            })
            .catch(() => { /* ignore */ });
        return () => { mounted = false };
    }, [])

    // Also refresh when opening the modal (ensures options are fresh)
    useEffect(() => {
        if (!showAddModal) return;
        let mounted = true;
        loadOptionsCache()
            .then(data => {
                if (!mounted) return;
                const names = (data.categories || []).map(c => c.name).filter(Boolean) as string[];
                setExternalCategories(normalizeCategories(names));
            })
            .catch(() => { /* ignore */ });
        return () => { mounted = false };
    }, [showAddModal])

    // Use the broadest category list for the manual add modal: union of backend categories, all storage items and cart items
    const modalCategoryOptions = useMemo(() => {
        const localCats = [
            ...store.storeItems.flatMap(item => item.categories || []),
            ...storedItems.flatMap(item => item.categories || []),
        ].filter(Boolean) as string[];
        const isBanned = (s: string) => /^\s*categorie\s*$/i.test(s);
        const union = [...externalCategories, ...localCats].filter((s) => !isBanned(String(s)));
        return normalizeCategories(union);
    }, [externalCategories, store.storeItems, storedItems])

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

    // Fuzzy match storage item by name to reuse icon/categories automatically
    const findBestStorageMatch = (name: string): StorageModel | undefined => {
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß\s]/gi, ' ').replace(/\s+/g, ' ').trim()
        const a = norm(name)
        if (!a) return undefined
        const aTokens = new Set(a.split(' '))
        let bestScore = 0
        let bestItem: StorageModel | undefined
        for (const it of store.storeItems) {
            const b = norm(it.name)
            if (!b) continue
            let score = 0
            if (a === b) score = 1
            else if (a.includes(b) || b.includes(a)) score = 0.85
            else {
                const bTokens = new Set(b.split(' '))
                let common = 0
                aTokens.forEach(t => { if (bTokens.has(t)) common++ })
                const denom = Math.max(aTokens.size, bTokens.size)
                score = denom > 0 ? common / denom : 0
            }
            if (score > bestScore) { bestScore = score; bestItem = it }
        }
        return bestScore >= 0.6 ? bestItem : bestItem && bestScore >= 0.45 ? bestItem : undefined
    }

    const onAddManualItem = async (): Promise<void> => {
        try {
            const values = await addForm.validateFields()
            const name = (values.name || '').trim()
            if (!name) return
            const amountNum = Math.max(1, Number(values.amount || 1))
            // Support tags mode (array) but keep only the last value as a single category
            const selectedCategoryRaw = Array.isArray(values.category)
                ? String(values.category[values.category.length - 1] || '')
                : String(values.category || '')
            const selectedCategory = selectedCategoryRaw.trim()
            const match = findBestStorageMatch(name)
            // Merge if identical name already exists in basket
            const existing = store.shoppingCard.find(i => i.name.toLowerCase() === name.toLowerCase())
            if (existing) {
                const nextAmount = String(Math.max(0, Number(existing.amount || 0) + amountNum))
                const updatedExisting = {
                    ...existing,
                    amount: nextAmount,
                    ...(selectedCategory ? { categories: [selectedCategory] } : {})
                }
                await actionHandler({ type: 'UPDATE_CARD_ITEM', basketItems: updatedExisting }, dispatch)
            } else {
                const basketItem: BasketModel = {
                    id: 0 as unknown as number,
                    name,
                    amount: String(amountNum),
                    categories: selectedCategory ? [selectedCategory] : (match?.categories || []),
                    icon: match?.icon || ''
                }
                await actionHandler({ type: 'ADD_TO_CARD', basketItems: basketItem }, dispatch)
            }
            setShowAddModal(false)
            addForm.resetFields()
        } catch {
            // ignore validation errors
        }
    }


    return (
        <>
            {/* Add manual item modal */}
            <Modal
                title={t('shopping.add.modalTitle')}
                visible={showAddModal}
                onCancel={() => setShowAddModal(false)}
                onOk={onAddManualItem}
                okText={t('shopping.add.addBtn')}
                cancelText={t('shopping.add.cancelBtn')}
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" initialValues={{ amount: 1 }}>
                    <Form.Item name="name" label={t('shopping.add.fields.name')} rules={[{ required: true, message: t('shopping.add.validation.nameRequired') }]}>
                        <Input placeholder={t('shopping.add.placeholders.name')} maxLength={120} />
                    </Form.Item>
                    <Form.Item name="amount" label={t('shopping.add.fields.amount')} rules={[{ type: 'number', min: 1, message: t('shopping.add.validation.amountMin') }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="category" label={t('shopping.add.fields.category')}>
                        <Select
                            mode="tags"
                            showSearch
                            allowClear
                            placeholder={t('shopping.add.placeholders.category')}
                            options={modalCategoryOptions.map(c => ({ label: c, value: c }))}
                            filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
                            tokenSeparators={[',']}
                            onChange={(vals) => {
                                const arr = Array.isArray(vals) ? vals : [vals];
                                const last = arr.length ? [arr[arr.length - 1]] : [];
                                addForm.setFieldsValue({ category: last });
                            }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{t('shopping.drawerTitle')}</span>
                        {(() => { const isDefault = sortField === 'name' && sortOrder === 'asc'; const count = selectedCategories.length + (searchText.trim() ? 1 : 0) + (isDefault ? 0 : 1); return count > 0 ? <Tag color="processing">{count} {t('shopping.activeCountSuffix')}</Tag> : null })()}
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
                            <div className={styles.label}>{t('shopping.labels.search')}</div>
                            <Input
                                placeholder={t('shopping.placeholders.searchName')}
                                value={searchText}
                                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1) }}
                            />
                        </div>
                        <div>
                            <div className={styles.label}>{t('shopping.labels.categories')}</div>
                            <Select
                                mode="multiple"
                                className={`${styles.dropdown} ${styles.mySelect}`}
                                placeholder={t('shopping.placeholders.selectCategories')}
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
                            <div className={styles.label}>{t('shopping.labels.sort')}</div>
                            <div className={styles.sortRow}>
                                <Select
                                    className={styles.dropdown}
                                    placeholder={t('shopping.placeholders.selectSortField')}
                                    value={sortField}
                                    onChange={(value) => { setSortField(value as 'name' | 'category'); setCurrentPage(1) }}
                                    suffixIcon={<DownOutlined style={{ fontSize: 18, color: '#666' }} />}
                                >
                                    <Select.Option key="name" value="name">{t('shopping.sortField.name')}</Select.Option>
                                    <Select.Option key="category" value="category">{t('shopping.sortField.category')}</Select.Option>
                                </Select>
                                <Tooltip title={sortOrder === 'asc' ? t('shopping.sortOrder.asc') : t('shopping.sortOrder.desc')}>
                                    <Button aria-label={t('shopping.sortOrder.toggleAria')} onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className={styles.orderButton}>
                                        {sortOrder === 'asc' ? <UpOutlined /> : <DownOutlined />}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {(selectedCategories.length > 0 || searchText.trim() || !(sortField === 'name' && sortOrder === 'asc')) && (
                        <div className={styles.chipsRow}>
                            {searchText.trim() && <Tag color="blue">{t('shopping.chips.searchPrefix')}{searchText.trim()}</Tag>}
                            {selectedCategories.map(c => (
                                <Tag key={`cat-${c}`} closable onClose={() => setSelectedCategories(prev => prev.filter(x => x !== c))}>{c}</Tag>
                            ))}
                            {!(sortField === 'name' && sortOrder === 'asc') && (
                                <Tag color="geekblue" closable onClose={() => { setSortField('name'); setSortOrder('asc') }}>{t('shopping.chips.sortPrefix')}{sortField === 'name' ? t('shopping.sortField.name') : t('shopping.sortField.category')} {sortOrder === 'asc' ? '↑' : '↓'}</Tag>
                            )}
                            <Button size="small" onClick={() => { setSelectedCategories([]); setSearchText(''); setSortField('name'); setSortOrder('asc'); setCurrentPage(1) }} className={styles.clearBtn}>{t('shopping.clearFilters')}</Button>
                        </div>
                    )}
                </div>
            </Drawer>

            {store.shoppingCard.length <= 0 && (
                <Message className='blue'
                    icon='shopping cart'
                    header={t('shopping.empty.header')}
                    content={t('shopping.empty.content')}
                />
            )}

            <div
                className={`space-align-container ${styles.itemsWrapper}`}
                style={{
                    justifyContent: 'flex-start',
                    display: 'flex',
                    flexWrap: 'wrap'
                }}
                ref={itemsWrapperRef}
            >
                {(dimensions.width > 450 && !(isPortrait && dimensions.width <= 600)) ? (
                    <>
                        {sortField === 'category' ? (
                            <>
                                {(() => {
                                    // Group current page by first category
                                    const groups = new Map<string, typeof paginatedItems>();
                                    paginatedItems.forEach(item => {
                                        const category = (item.categories && item.categories[0]) || t('shopping.uncategorized')
                                        if (!groups.has(category)) groups.set(category, [])
                                        groups.get(category)!.push(item)
                                    })
                                    return Array.from(groups.entries()).map(([category, items]) => (
                                        <React.Fragment key={`cat-${category}`}>
                                            <div style={{ width: '100%' }}>
                                                <Divider orientation="left">{category}</Divider>
                                            </div>
                                            <ShoppingCard storedItems={items} dimensions={dimensions} />
                                        </React.Fragment>
                                    ))
                                })()}
                            </>
                        ) : (
                            <ShoppingCard storedItems={paginatedItems} dimensions={dimensions} />
                        )}
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

            {/* Floating add button */}
            <Button
                type="primary"
                shape="circle"
                size="large"
                aria-label={t('shopping.add.fabAria')}
                style={{
                    position: 'fixed',
                    right: 24,
                    // Place above bottom navbar on mobile (<= 600px width)
                    bottom: (isPortrait && dimensions.width <= 600)
                        ? `calc(96px + env(safe-area-inset-bottom))`
                        : 24,
                    zIndex: 1100,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                }}
                icon={<PlusOutlined />}
                onClick={() => { addForm.resetFields(); setShowAddModal(true) }}
            />
        </>
    )
}
