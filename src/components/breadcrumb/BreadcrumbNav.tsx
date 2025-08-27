import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button } from 'antd';
import { HomeOutlined, FilterOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import { rootRoute, homeRoute, itemsRoute, newItemRoute, checklistRoute, basketRoute, userRoute, loginRoute, detailsRouteBase } from '../../shared/Constants';
import styles from './BreadcrumbNav.module.css';

const BreadcrumbNav: React.FC = () => {
    const location = useLocation();
    const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
    const [activeShoppingFilterCount, setActiveShoppingFilterCount] = useState<number>(0);

    useEffect(() => {
        const onFiltersChanged = (e: Event) => {
            const custom = e as CustomEvent<{ count: number }>;
            const next = typeof custom.detail?.count === 'number' ? custom.detail.count : 0;
            setActiveFilterCount(next);
        };
        window.addEventListener('storageFiltersChanged', onFiltersChanged as EventListener);
        // initialize from sessionStorage so the count appears even before the first change event
        try {
            const raw = sessionStorage.getItem('storageFilters');
            if (raw) {
                const f = JSON.parse(raw);
                const isDefaultSort = (f.sortField ?? 'name') === 'name' && (f.sortOrder ?? 'asc') === 'asc';
                const count =
                    (Array.isArray(f.selectedCategories) ? f.selectedCategories.length : 0) +
                    (Array.isArray(f.selectedLocations) ? f.selectedLocations.length : 0) +
                    (Array.isArray(f.selectedUnits) ? f.selectedUnits.length : 0) +
                    (f.onlyZero ? 1 : 0) +
                    (Array.isArray(f.stockStatus) ? f.stockStatus.length : 0) +
                    (typeof f.searchText === 'string' && f.searchText.trim() ? 1 : 0) +
                    (isDefaultSort ? 0 : 1);
                setActiveFilterCount(count);
            }
        } catch { /* noop */ }
        return () => window.removeEventListener('storageFiltersChanged', onFiltersChanged as EventListener);
    }, []);

    // Listen to Shopping (basket) filter changes
    useEffect(() => {
        const onShoppingFiltersChanged = (e: Event) => {
            const custom = e as CustomEvent<{ count: number }>;
            const next = typeof custom.detail?.count === 'number' ? custom.detail.count : 0;
            setActiveShoppingFilterCount(next);
        };
        window.addEventListener('shoppingFiltersChanged', onShoppingFiltersChanged as EventListener);
        // initialize from sessionStorage
        try {
            const raw = sessionStorage.getItem('shoppingFilters');
            if (raw) {
                const f = JSON.parse(raw);
                const isDefaultSort = (f.sortField ?? 'name') === 'name' && (f.sortOrder ?? 'asc') === 'asc';
                const count =
                    (Array.isArray(f.selectedCategories) ? f.selectedCategories.length : 0) +
                    (typeof f.searchText === 'string' && f.searchText.trim() ? 1 : 0) +
                    (isDefaultSort ? 0 : 1);
                setActiveShoppingFilterCount(count);
            }
        } catch { /* noop */ }
        return () => window.removeEventListener('shoppingFiltersChanged', onShoppingFiltersChanged as EventListener);
    }, []);

    // Route-zu-Breadcrumb-Mapping
    const getBreadcrumbItems = (pathname: string) => {
        const items = [
            {
                title: <Link to={rootRoute}><HomeOutlined /> Home</Link>,
                key: 'home'
            }
        ];

        if (pathname.startsWith(itemsRoute)) {
            items.push({
                title: <Link to={itemsRoute}>Storage</Link>,
                key: 'storage'
            });

            if (pathname.includes('/new')) {
                items.push({
                    title: <Link to={newItemRoute}>Neues Item</Link>,
                    key: 'new-item'
                });
            } else if (pathname.includes('/edit')) {
                items.push({
                    title: <Link to="">Item bearbeiten</Link>,
                    key: 'edit-item'
                });
            } else if (pathname !== itemsRoute) {
                items.push({
                    title: <Link to="">Item Details</Link>,
                    key: 'item-details'
                });
            }
        } else if (pathname.startsWith(`${detailsRouteBase}/`)) {
            const category = pathname.split('/')[2];
            const categoryNames: Record<string, string> = {
                'lebensmittel': 'Lebensmittelvorrat',
                'wasser': 'Trinkwasservorrat',
                'medikamente': 'Medikamente & Erste-Hilfe',
                'hygiene': 'Hygiene & Desinfektion',
                'informieren': 'Notfallausrüstung & Kommunikation',
                'dokumente': 'Wichtige Dokumente',
                'gepaeck': 'Notfallgepäck & Fluchtrucksack',
                'sicherheit': 'Sicherheit im Haus',
                'beduerfnisse': 'Spezielle Bedürfnisse'
            };

            items.push({
                title: <Link to={homeRoute}>Notfallvorsorge</Link>,
                key: 'emergency'
            });

            items.push({
                title: <Link to="">{categoryNames[category] || category}</Link>,
                key: category
            });
        } else if (pathname === checklistRoute) {
            items.push({
                title: <Link to="">Checkliste</Link>,
                key: 'checklist'
            });
        } else if (pathname === basketRoute) {
            items.push({
                title: <Link to="">Einkaufsliste</Link>,
                key: 'basket'
            });
        } else if (pathname === userRoute) {
            items.push({
                title: <Link to="">Benutzerprofil</Link>,
                key: 'user'
            });
        } else if (pathname === loginRoute) {
            items.push({
                title: <Link to="">Anmeldung</Link>,
                key: 'login'
            });
        }

        return items;
    };

    const breadcrumbItems = getBreadcrumbItems(location.pathname);

    const isStorageList = location.pathname === itemsRoute;
    const isBasketList = location.pathname === basketRoute;

    const openStorageFilters = () => {
        window.dispatchEvent(new CustomEvent('openStorageFilters'));
    };
    const openShoppingFilters = () => {
        window.dispatchEvent(new CustomEvent('openShoppingFilters'));
    };

    // Zeige Breadcrumb nur an, wenn mehr als nur Home vorhanden ist
    if (breadcrumbItems.length <= 1) {
        return null;
    } return (
        <div className={styles.breadcrumbBar}>
            <Breadcrumb className={styles.breadcrumbContainer}>
                {breadcrumbItems.map(item => (
                    <Breadcrumb.Item key={item.key}>{item.title}</Breadcrumb.Item>
                ))}
            </Breadcrumb>
            {isStorageList && (
                <Button
                    type="default"
                    icon={<FilterOutlined />}
                    onClick={openStorageFilters}
                    aria-label={activeFilterCount > 0 ? `Filter öffnen – ${activeFilterCount} aktiv` : 'Filter öffnen'}
                    className={styles.filterButton}
                >
                    {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
                </Button>
            )}
            {isBasketList && (
                <Button
                    type="default"
                    icon={<FilterOutlined />}
                    onClick={openShoppingFilters}
                    aria-label={activeShoppingFilterCount > 0 ? `Filter öffnen – ${activeShoppingFilterCount} aktiv` : 'Filter öffnen'}
                    className={styles.filterButton}
                >
                    {activeShoppingFilterCount > 0 ? `Filter (${activeShoppingFilterCount})` : 'Filter'}
                </Button>
            )}
        </div>
    );
};

export default BreadcrumbNav;
