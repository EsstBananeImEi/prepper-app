import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useLocation, Link } from 'react-router-dom';

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
                    title: <span>Neues Item</span>,
                    key: 'new-item'
                });
            } else if (pathname.includes('/edit')) {
                items.push({
                    title: <span>Item bearbeiten</span>,
                    key: 'edit-item'
                });
            } else if (pathname !== '/items') {
                items.push({
                    title: <span>Item Details</span>,
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
                title: <span>Notfallvorsorge</span>,
                key: 'emergency'
            });

            items.push({
                title: <span>{categoryNames[category] || category}</span>,
                key: category
            });
        } else if (pathname === '/checklist') {
            items.push({
                title: <span>Checkliste</span>,
                key: 'checklist'
            });
        } else if (pathname === '/basket') {
            items.push({
                title: <span>Einkaufsliste</span>,
                key: 'basket'
            });
        } else if (pathname === '/user') {
            items.push({
                title: <span>Benutzerprofil</span>,
                key: 'user'
            });
        } else if (pathname === '/login') {
            items.push({
                title: <span>Anmeldung</span>,
                key: 'login'
            });
        }

        return items;
    };

    const breadcrumbItems = getBreadcrumbItems(location.pathname);

    // Zeige Breadcrumb nur an, wenn mehr als nur Home vorhanden ist
    if (breadcrumbItems.length <= 1) {
        return null;
    }

    return (
        <Breadcrumb
            style={{
                margin: '16px 0',
                padding: '0 var(--spacing-md)',
                fontSize: 'var(--font-size-base)'
            }}
        >
            {breadcrumbItems.map(item => (
                <Breadcrumb.Item key={item.key}>{item.title}</Breadcrumb.Item>
            ))}
        </Breadcrumb>
    );
};

export default BreadcrumbNav;
