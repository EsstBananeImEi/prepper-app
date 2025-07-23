import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';
import styles from './BreadcrumbNav.module.css';

const BreadcrumbNav: React.FC = () => {
    const location = useLocation();

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

    // Zeige Breadcrumb nur an, wenn mehr als nur Home vorhanden ist
    if (breadcrumbItems.length <= 1) {
        return null;
    } return (
        <Breadcrumb className={styles.breadcrumbContainer}>
            {breadcrumbItems.map(item => (
                <Breadcrumb.Item key={item.key}>{item.title}</Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
};

export default BreadcrumbNav;
