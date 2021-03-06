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
import { homeRoute, storedBasketRoute, storedItemsRoute, storedNewItemRoute } from '../../shared/Constants';

export default function NavBar(): ReactElement {
    const { Header } = Layout;
    const [dimensions] = useDemensions(() => 1, 0)
    const location = useLocation()
    const paths = [
        { url: 'edit', name: "Edit" },
        { url: 'storeditems', name: "List" },
        { url: 'home', name: 'Home' },
        { url: '', name: 'Home' },
        { url: 'shopping', name: 'Shopping' },
    ]


    return (
        <Header>
            {dimensions.width > 600
                ? <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['Home']}>
                    <Menu.Item key='Home' >
                        <NavLink to={homeRoute}>
                            <span className="nav-text">Home</span>
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key='storage' >
                        <NavLink exact to={storedItemsRoute}>
                            <span className="nav-text">Storage</span>
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key='newItem' >
                        <NavLink to={storedNewItemRoute}>
                            <span className="nav-text">Add Item</span>
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key='shopping' >
                        <NavLink to={storedBasketRoute}>
                            <span className="nav-text">Basket</span>
                        </NavLink>
                    </Menu.Item>
                </Menu>
                : <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[document.location.pathname]}>
                    <Menu.Item key='/home' style={{ alignItems: 'center', width: '65px' }}>
                        <NavLink to={homeRoute}>
                            <HomeOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key='storeditems' style={{ alignItems: 'center', width: '65px' }}>
                        <NavLink to={storedItemsRoute}>
                            <UnorderedListOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key='new' style={{ alignItems: 'center', width: '65px' }}>
                        <NavLink to={storedNewItemRoute}>
                            <PlusOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item key='shopping' style={{ alignItems: 'center', width: '65px' }}>
                        <NavLink to={storedBasketRoute}>
                            <ShoppingCartOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </NavLink>
                    </Menu.Item>
                </Menu>
            }
        </Header>
    )
}