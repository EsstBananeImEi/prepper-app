import {
    HomeOutlined,
    PlusOutlined,
    UnorderedListOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
    CheckSquareOutlined,
    BugOutlined,
    SearchOutlined,
    MenuOutlined,
    CloseOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Badge, Layout, Menu, Avatar, Dropdown, Card, Typography, Button } from 'antd';
import React, { ReactElement, useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDemensions } from '../../hooks/StorageApi';
import { homeRoute, basketRoute, itemsRoute, newItemRoute, userApi, loginApi, checklistRoute, adminRoute } from '../../shared/Constants';
import logo from '../../static/images/prepper-app.svg';
import { useStore } from '../../store/Store';
import style from './NavBar.module.css';
import GlobalSearch from '../search/GlobalSearch';
import ApiDebugPanel from '../debug/ApiDebugPanel';
import DraggableDebugButton from '../debug/DraggableDebugButton';

const { Text } = Typography;

export default function NavBar(): ReactElement {
    const { Header } = Layout;
    const [dimensions] = useDemensions(() => 1, 0);
    const location = useLocation();
    const { store, dispatch } = useStore();
    const navigate = useNavigate();
    const isLoggedIn = !!store.user;
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
    const [debugPanelVisible, setDebugPanelVisible] = useState(false);
    const [burgerMenuVisible, setBurgerMenuVisible] = useState(false);

    // Check if user is admin and debug panel is enabled
    const isAdmin = store.user?.isAdmin ?? false;

    const debugPanelEnabled = localStorage.getItem('debugPanelEnabled') === 'true';
    const shouldShowDebugButton = isLoggedIn && isAdmin && debugPanelEnabled;

    // Check if we should show burger menu (screen width < 430px)
    const shouldShowBurgerMenu = dimensions.width <= 430;

    const getSelectedKeysDesktop = useCallback((): string[] => {
        if (isLoggedIn && location.pathname === homeRoute) return ['home'];
        if (location.pathname === itemsRoute) return ['items'];
        if (location.pathname === newItemRoute) return ['newItem'];
        if (location.pathname === basketRoute) return ['shopping'];
        if (location.pathname === checklistRoute) return ['checklist'];
        if (location.pathname === userApi || location.pathname === loginApi) return ['auth'];
        return [];
    }, [isLoggedIn, location.pathname]);

    useEffect(() => {
        setSelectedKeys(getSelectedKeysDesktop());
    }, [getSelectedKeysDesktop]);

    // Close burger menu when clicking outside or on route change
    useEffect(() => {
        setBurgerMenuVisible(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (burgerMenuVisible && !(event.target as Element).closest(`.${style.mobileNav}`)) {
                setBurgerMenuVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [burgerMenuVisible]);

    const countItems = () => {
        // filter items by unique name and count them
        const uniqueItems = new Set(store.shoppingCard.map(item => item.name));
        const items = uniqueItems.size;
        return items > 0 ? items : null;
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT_USER" });
        navigate(homeRoute);
    };

    const userMenu = (
        <Card className={style.userDropdown}>
            {isLoggedIn ? (
                <>
                    <div className={style.userInfo}>
                        <Avatar
                            src={store.user?.image || undefined}
                            icon={!store.user?.image ? <UserOutlined /> : undefined}
                            className={style.userAvatar}
                        />
                        <div>
                            <Text strong>{store.user?.username || "Benutzer"}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {store.user?.email}
                            </Text>
                        </div>
                    </div>
                    <Menu className={style.menuList}>
                        <Menu.Item key="profile" icon={<ProfileOutlined />}>
                            <NavLink to={userApi}>Profil</NavLink>
                        </Menu.Item>
                        {isAdmin && (
                            <Menu.Item key="admin" icon={<SettingOutlined />}>
                                <NavLink to={adminRoute}>Admin-Panel</NavLink>
                            </Menu.Item>
                        )}
                        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                            Logout
                        </Menu.Item>
                    </Menu>
                </>
            ) : (
                <Menu className={style.menuList}>
                    <Menu.Item key="login">
                        <NavLink to={loginApi}>Login</NavLink>
                    </Menu.Item>
                </Menu>
            )}
        </Card>
    );

    return (
        <Header className={style.header}>
            {dimensions.width > 600 ? (
                <>
                    <NavLink to={homeRoute}>
                        <img src={logo} alt="Logo" className={style.logo} />
                    </NavLink>
                    {isLoggedIn && (
                        <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeysDesktop()} className={style.menu}>
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
                            <Menu.Item key="checklist">
                                <NavLink to={checklistRoute}>
                                    <span className="nav-text">Checklist</span>
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key="shopping">
                                <NavLink to={basketRoute}>
                                    <span className="nav-text">Basket</span>
                                    <Badge offset={[5, -5]} size="small" count={countItems()}>
                                    </Badge>
                                </NavLink>
                            </Menu.Item>
                        </Menu>
                    )}

                    {/* Globale Suche für Desktop */}
                    {isLoggedIn && (
                        <div style={{ marginRight: 'var(--spacing-md)', flex: '0 0 300px' }}>
                            <GlobalSearch />
                        </div>
                    )}

                    {isLoggedIn ? (
                        <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                            <div className={style.userMenuMobile}>
                                <Avatar
                                    src={store.user?.image || undefined}
                                    icon={!store.user?.image ? <UserOutlined /> : undefined}
                                    className={style.userAvatar}
                                />
                            </div>
                        </Dropdown>
                    ) : (
                        <div className={style.userMenuMobile}>
                            <NavLink to={loginApi}>
                                <Avatar
                                    src={store.user?.image || undefined}
                                    icon={!store.user?.image ? <UserOutlined /> : undefined}
                                    className={style.userAvatar}
                                />
                            </NavLink>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Mobile Top Header - Logo, GlobalSearch, User */}
                    <div className={style.mobileTopHeader}>
                        <NavLink to={homeRoute}>
                            <img src={logo} alt="Logo" className={style.logo} />
                        </NavLink>

                        {/* GlobalSearch in der Mitte für Mobile */}
                        {isLoggedIn && (
                            <div className={style.mobileSearchContainer}>
                                <GlobalSearch />
                            </div>
                        )}

                        {isLoggedIn ? (
                            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                                <div className={style.userMenuMobile}>
                                    <Avatar
                                        src={store.user?.image || undefined}
                                        icon={!store.user?.image ? <UserOutlined /> : undefined}
                                        className={style.userAvatar}
                                    />
                                </div>
                            </Dropdown>
                        ) : (
                            <div className={style.userMenuMobile}>
                                <NavLink to={loginApi}>
                                    <Avatar
                                        src={store.user?.image || undefined}
                                        icon={!store.user?.image ? <UserOutlined /> : undefined}
                                        className={style.userAvatar}
                                    />
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Bottom Navigation */}
                    <div className={style.mobileNavContainer}>
                        <div className={style.mobileNav}>
                            <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeysDesktop()} className={style.menu}>
                                {/* Home Item */}
                                <Menu.Item key="home" data-menu-id="home" data-label="Home">
                                    <NavLink to={homeRoute}>
                                        <HomeOutlined className={style.icon} />
                                    </NavLink>
                                </Menu.Item>

                                {/* Show all navigation items in bottom nav when logged in */}
                                {isLoggedIn && (
                                    <>
                                        <Menu.Item key="checklist" data-label="Checklist">
                                            <NavLink to={checklistRoute}>
                                                <CheckSquareOutlined className={style.icon} />
                                            </NavLink>
                                        </Menu.Item>
                                        <Menu.Item key="items" data-label="Storage">
                                            <NavLink to={itemsRoute}>
                                                <UnorderedListOutlined className={style.icon} />
                                            </NavLink>
                                        </Menu.Item>
                                        <Menu.Item key="newItem" data-label="Add">
                                            <NavLink to={newItemRoute}>
                                                <PlusOutlined className={style.icon} />
                                            </NavLink>
                                        </Menu.Item>
                                        <Menu.Item key="shopping" data-label="Basket">
                                            <NavLink to={basketRoute}>
                                                <Badge offset={[0, 0]} size="small" count={countItems()}>
                                                    <ShoppingCartOutlined className={style.icon} />
                                                </Badge>
                                            </NavLink>
                                        </Menu.Item>
                                    </>
                                )}
                            </Menu>
                        </div>
                    </div>
                </>
            )}

            {/* Debug Panel */}
            <ApiDebugPanel
                visible={debugPanelVisible}
                onClose={() => setDebugPanelVisible(false)}
            />

            {/* Draggable Debug Button - only for admin users with debug enabled */}
            {shouldShowDebugButton && (
                <DraggableDebugButton
                    onClick={() => setDebugPanelVisible(true)}
                />
            )}
        </Header>
    );
}
