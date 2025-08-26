import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button } from 'antd';
import { HomeOutlined, FilterOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import styles from './BreadcrumbNav.module.css';

const BreadcrumbNav: React.FC = () => {
    const location = useLocation();
    const [activeFilterCount, setActiveFilterCount] = useState<number>(0);

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

    // Route-zu-Breadcrumb-Mapping
    const getBreadcrumbItems = (pathname: string) => {
        const items = [
            {
                title: <Link to="/"><HomeOutlined /> Home</Link>,
                key: 'home'
            }
        ];

        if (pathname.startsWith('/items')) {
            items.push({
                title: <Link to="/items">Storage</Link>,
                key: 'storage'
            });

            if (pathname.includes('/new')) {
                items.push({
                    title: <Link to="/items/new">Neues Item</Link>,
                    key: 'new-item'
                });
            } else if (pathname.includes('/edit')) {
                items.push({
                    title: <Link to="">Item bearbeiten</Link>,
                    key: 'edit-item'
                });
            } else if (pathname !== '/items') {
                items.push({
                    title: <Link to="">Item Details</Link>,
                    key: 'item-details'
                });
            }
        } else if (pathname.startsWith('/details/')) {
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
                title: <Link to="home">Notfallvorsorge</Link>,
                key: 'emergency'
            });

            items.push({
                title: <Link to="">{categoryNames[category] || category}</Link>,
                key: category
            });
        } else if (pathname === '/checklist') {
            items.push({
                title: <Link to="">Checkliste</Link>,
                key: 'checklist'
            });
        } else if (pathname === '/basket') {
            items.push({
                title: <Link to="">Einkaufsliste</Link>,
                key: 'basket'
            });
        } else if (pathname === '/user') {
            items.push({
                title: <Link to="">Benutzerprofil</Link>,
                key: 'user'
            });
        } else if (pathname === '/login') {
            items.push({
                title: <Link to="">Anmeldung</Link>,
                key: 'login'
            });
        }

        return items;
    };

    const breadcrumbItems = getBreadcrumbItems(location.pathname);

    const isStorageList = location.pathname === '/items';

    const openStorageFilters = () => {
        window.dispatchEvent(new CustomEvent('openStorageFilters'));
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
        </div>
    );
};

export default BreadcrumbNav;
