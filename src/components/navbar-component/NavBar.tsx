import {
    HomeOutlined,
    PlusOutlined,
    UnorderedListOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { ReactElement } from 'react';
import { NavLink, useLocation } from "react-router-dom";
import { useDemensions } from '../../hooks/StorageApi';
import { homeRoute, basketRoute, itemsRoute, newItemRoute } from '../../shared/Constants';
import logo from '../../static/images/prepper-app.svg';

export default function NavBar(): ReactElement {
    const { Header } = Layout;
    const [dimensions] = useDemensions(() => 1, 0);
    const location = useLocation();

    // Exakte Menü-Keys für Mobile setzen
    const getSelectedKeysMobile = (): string[] => {
        switch (location.pathname) {
            case homeRoute:
                return ['/home'];
            case itemsRoute:
                return ['/items'];
            case newItemRoute:
                return ['/items/new'];
            case basketRoute:
                return ['/basket'];
            default:
                return [];
        }
    };

    // Desktop: Home hat kein aktives Menü-Item
    const getSelectedKeysDesktop = (): string[] => {
        if (location.pathname === homeRoute) return [];
        if (location.pathname === itemsRoute) return ['storage'];
        if (location.pathname === newItemRoute) return ['newItem'];
        if (location.pathname === basketRoute) return ['shopping'];
        return [];
    };

    return (
        <Header style={{ display: 'flex', alignItems: 'center' }}>
            {dimensions.width > 600 ? (
                // Desktop-Modus: Logo sichtbar, "Home" nicht im Menü
                <>
                    <NavLink to={homeRoute}>
                        <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '20px' }} />
                    </NavLink>
                    <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeysDesktop()} style={{ flex: 1 }}>
                        <Menu.Item key="storage">
                            <NavLink to={itemsRoute}>
                                <span className="nav-text">Storage</span>
                            </NavLink>
                        </Menu.Item>
                        <Menu.Item key="newItem">
                            <NavLink to={newItemRoute}>
                                <span className="nav-text">Add Item</span>
                            </NavLink>
                        </Menu.Item>
                        <Menu.Item key="shopping">
                            <NavLink to={basketRoute}>
                                <span className="nav-text">Basket</span>
                            </NavLink>
                        </Menu.Item>
                    </Menu>
                </>
            ) : (
                // Mobile-Modus: Logo nicht sichtbar, stattdessen Home-Icon
                <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeysMobile()} style={{ flex: 1 }}>
                    <Menu.Item key="/home" style={{ width: '65px' }}>
                        <NavLink to={homeRoute}>
                            <HomeOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key="/items" style={{ width: '65px' }}>
                        <NavLink to={itemsRoute}>
                            <UnorderedListOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key="/items/new" style={{ width: '65px' }}>
                        <NavLink to={newItemRoute}>
                            <PlusOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key="/basket" style={{ width: '65px' }}>
                        <NavLink to={basketRoute}>
                            <ShoppingCartOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                </Menu>
            )}
        </Header>
    );
}
