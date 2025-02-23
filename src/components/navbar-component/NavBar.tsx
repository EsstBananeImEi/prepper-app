import {
    HomeOutlined,
    PlusOutlined,
    UnorderedListOutlined,
    ShoppingCartOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Badge, Layout, Menu, Avatar, Dropdown } from 'antd';
import React, { ReactElement } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDemensions } from '../../hooks/StorageApi';
import { homeRoute, basketRoute, itemsRoute, newItemRoute, userApi, loginApi } from '../../shared/Constants';
import logo from '../../static/images/prepper-app.svg';
import { useStore } from '../../store/Store';
import style from './NavBar.module.css';

export default function NavBar(): ReactElement {
    const { Header } = Layout;
    const [dimensions] = useDemensions(() => 1, 0);
    const location = useLocation();
    const { store, dispatch } = useStore();
    const navigate = useNavigate();
    const isLoggedIn = !!store.user;

    const getSelectedKeysDesktop = (): string[] => {
        if (location.pathname === homeRoute) return [];
        if (location.pathname === itemsRoute) return ['storage'];
        if (location.pathname === newItemRoute) return ['newItem'];
        if (location.pathname === basketRoute) return ['shopping'];
        if (location.pathname === userApi || location.pathname === loginApi) return ['auth'];
        return [];
    };

    const countItems = () => {
        return store.shoppingCard.length;
    };

    // Logout-Handler (füge hier die tatsächliche Logout-Logik hinzu)
    const handleLogout = () => {
        localStorage.removeItem("user");  // Token aus dem LocalStorage entfernen
        dispatch({ type: "LOGOUT_USER" });
        navigate(homeRoute) // State aktualisieren
    };

    // Dropdown-Menü für User
    const userMenu = (
        <Menu>
            {isLoggedIn ? (
                <>
                    <Menu.Item key="profile">
                        <NavLink to={userApi}>Profil</NavLink>
                    </Menu.Item>
                    <Menu.Item key="logout" onClick={handleLogout}>
                        Logout
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item key="login">
                    <NavLink to={loginApi}>Login</NavLink>
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <Header className={style.header}>
            {dimensions.width > 600 ? (
                <>
                    <NavLink to={homeRoute}>
                        <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '20px' }} />
                    </NavLink>
                    {isLoggedIn && (
                        <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeysDesktop()} style={{ flex: 1 }}>
                            <Menu.Item key="storage">
                                <NavLink to={itemsRoute}>Storage</NavLink>
                            </Menu.Item>
                            <Menu.Item key="newItem">
                                <NavLink to={newItemRoute}>Add Item</NavLink>
                            </Menu.Item>
                            <Menu.Item key="shopping">
                                <NavLink to={basketRoute}>
                                    <Badge offset={[5, -5]} size="small" count={countItems()}>
                                        <span className="nav-text" style={{ color: 'lightgray' }}>Basket</span>
                                    </Badge>
                                </NavLink>
                            </Menu.Item>
                        </Menu>
                    )}
                    {/* User-Dropdown-Menü */}
                    <Dropdown overlay={userMenu} trigger={['click']}>
                        <div className={style.userMenu}>
                            <Avatar
                                src={store.user?.image || undefined}
                                icon={!store.user?.image ? <UserOutlined /> : undefined}
                                className={style.userAvatar}
                            />
                        </div>
                    </Dropdown>
                </>
            ) : (
                // Mobile Navigation mit Dropdown für User
                <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeysDesktop()} style={{ flex: 1 }}>
                    <Menu.Item key="home">
                        <NavLink to={homeRoute}>
                            <HomeOutlined style={{ fontSize: '25px' }} />
                        </NavLink>
                    </Menu.Item>
                    {isLoggedIn && (
                        <>
                            <Menu.Item key="items">
                                <NavLink to={itemsRoute}>
                                    <UnorderedListOutlined style={{ fontSize: '25px' }} />
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key="newItem">
                                <NavLink to={newItemRoute}>
                                    <PlusOutlined style={{ fontSize: '25px' }} />
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key="shopping">
                                <NavLink to={basketRoute}>
                                    <Badge offset={[0, 0]} size="small" count={countItems()}>
                                        <ShoppingCartOutlined style={{ fontSize: '25px', color: 'lightgray' }} />
                                    </Badge>
                                </NavLink>
                            </Menu.Item>
                        </>
                    )}
                    <Dropdown overlay={userMenu} trigger={['click']}>
                        <div className={style.userMenu}>
                            <Avatar
                                src={store.user?.image || undefined}
                                icon={!store.user?.image ? <UserOutlined /> : undefined}
                                className={style.userAvatar}
                            />
                        </div>
                    </Dropdown>
                </Menu>
            )}
        </Header>
    );
}
