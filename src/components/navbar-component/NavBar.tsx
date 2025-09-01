import {
    HomeTwoTone,
    ProfileTwoTone,
    ShoppingTwoTone,
    CheckCircleTwoTone,
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
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
import { homeRoute, basketRoute, itemsRoute, newItemRoute, userApi, loginApi, checklistRoute, adminRoute, impressumRoute, privacyRoute, settingsRoute } from '../../shared/Constants';
import { adminUsersRoute } from '../../shared/Constants';
import logo from '../../static/images/prepper-app.svg';
import { useStore } from '../../store/Store';
import style from './NavBar.module.css';
import GlobalSearch from '../search/GlobalSearch';
import ApiDebugPanel from '../debug/ApiDebugPanel';
import DraggableDebugButton from '../debug/DraggableDebugButton';
import { useAdminValidation } from '../../hooks/useAdminValidation';
import { clearOptionsCache } from '../../utils/optionsCache';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../utils/secureApiClient';

const { Text } = Typography;

export default function NavBar(): ReactElement {
    const { t } = useTranslation();
    const { Header } = Layout;
    const [dimensions] = useDemensions(() => 1, 0);
    const location = useLocation();
    const { store, dispatch } = useStore();
    const navigate = useNavigate();
    const isLoggedIn = !!store.user;
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
    const [debugPanelVisible, setDebugPanelVisible] = useState(false);
    const [burgerMenuVisible, setBurgerMenuVisible] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Secure admin validation using server-side check
    const { isAdmin, isValidating: adminValidating } = useAdminValidation();

    const debugPanelEnabled = localStorage.getItem('debugPanelEnabled') === 'true';
    const shouldShowDebugButton = isLoggedIn && isAdmin && debugPanelEnabled && !adminValidating;

    const getSelectedKeysDesktop = useCallback((): string[] => {
        if (isLoggedIn && location.pathname === homeRoute) return ['home'];
        if (location.pathname === itemsRoute) return ['items'];
        // no explicit selection for new item creation route in navbar
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

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch {
            // ignore errors
        } finally {
            localStorage.removeItem("user");
            clearOptionsCache();
            dispatch({ type: "LOGOUT_USER" });
            navigate(homeRoute);
        }
    };

    const userMenu = (
        <Card className={style.userDropdown}>
            {isLoggedIn ? (
                <>
                    <div
                        className={style.userInfo}
                        role="button"
                        tabIndex={0}
                        onClick={() => { setUserMenuOpen(false); navigate(userApi); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setUserMenuOpen(false); navigate(userApi); } }}
                    >
                        <Avatar
                            src={store.user?.image || undefined}
                            icon={!store.user?.image ? <UserOutlined /> : undefined}
                            className={style.userAvatar}
                        />
                        <div>
                            <Text strong>{store.user?.username || t('common.user')}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {store.user?.email}
                            </Text>
                        </div>
                    </div>
                    <Menu className={style.menuList}>
                        <Menu.Item key="label-account" disabled>
                            <Text type="secondary" style={{ fontSize: 12 }}>{t('navbar.section.account', 'Konto')}</Text>
                        </Menu.Item>
                        {/* Konto */}
                        <Menu.Item key="settings">
                            <NavLink to={settingsRoute}>{t('settings.title', 'Einstellungen')}</NavLink>
                        </Menu.Item>

                        {(!adminValidating && (isAdmin || store.user?.isManager)) && (
                            <>
                                <Menu.Divider />
                                <Menu.Item key="label-admin" disabled>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{t('navbar.section.admin', 'Verwaltung')}</Text>
                                </Menu.Item>
                                {isAdmin && (
                                    <Menu.Item key="admin" icon={<SettingOutlined />}>
                                        <NavLink to={adminRoute}>{t('navbar.adminPanel')}</NavLink>
                                    </Menu.Item>
                                )}
                                <Menu.Item key="adminUsers" icon={<UserOutlined />}>
                                    <NavLink to={adminUsersRoute}>Benutzerverwaltung</NavLink>
                                </Menu.Item>
                            </>
                        )}

                        <Menu.Divider />
                        <Menu.Item key="label-legal" disabled>
                            <Text type="secondary" style={{ fontSize: 12 }}>{t('navbar.section.legal', 'Rechtliches')}</Text>
                        </Menu.Item>
                        <Menu.Item key="impressum">
                            <NavLink to={impressumRoute}>{t('common.impressum')}</NavLink>
                        </Menu.Item>
                        <Menu.Item key="privacy">
                            <NavLink to={privacyRoute}>{t('common.privacy')}</NavLink>
                        </Menu.Item>

                        <Menu.Divider />
                        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                            {t('navbar.logout')}
                        </Menu.Item>
                    </Menu>
                </>
            ) : (
                <Menu className={style.menuList}>
                    <Menu.Item key="label-general" disabled>
                        <Text type="secondary" style={{ fontSize: 12 }}>{t('navbar.section.general', 'Allgemein')}</Text>
                    </Menu.Item>
                    <Menu.Item key="login">
                        <NavLink to={loginApi}>{t('common.login')}</NavLink>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item key="label-legal" disabled>
                        <Text type="secondary" style={{ fontSize: 12 }}>{t('navbar.section.legal', 'Rechtliches')}</Text>
                    </Menu.Item>
                    <Menu.Item key="impressum">
                        <NavLink to={impressumRoute}>{t('common.impressum')}</NavLink>
                    </Menu.Item>
                    <Menu.Item key="privacy">
                        <NavLink to={privacyRoute}>{t('common.privacy')}</NavLink>
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
                        <Menu theme="dark" mode="horizontal" selectedKeys={selectedKeys} className={style.menu}>
                            <Menu.Item key="storage">
                                <NavLink to={itemsRoute}>
                                    <span className="nav-text">{t('common.storage_plural')}</span>
                                </NavLink>
                            </Menu.Item>
                            {/* Removed 'Neu anlegen' from navbar as per request */}
                            <Menu.Item key="checklist">
                                <NavLink to={checklistRoute}>
                                    <span className="nav-text">{t('common.checklist')}</span>
                                </NavLink>
                            </Menu.Item>
                            <Menu.Item key="shopping">
                                <NavLink to={basketRoute}>
                                    <span className="nav-text">{t('common.basket')}</span>
                                    <Badge offset={[5, -5]} size="small" count={countItems()}>
                                    </Badge>
                                </NavLink>
                            </Menu.Item>
                        </Menu>
                    )}

                    {/* Globale Suche für Desktop */}
                    {isLoggedIn && (
                        <div className={style.desktopSearch}>
                            <GlobalSearch />
                        </div>
                    )}

                    <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight" open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                        <div className={style.userMenuMobile}>
                            <Avatar
                                src={store.user?.image || undefined}
                                icon={!store.user?.image ? <UserOutlined /> : undefined}
                                className={style.userAvatar}
                            />
                        </div>
                    </Dropdown>
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

                        <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight" open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                            <div className={style.userMenuMobile}>
                                <Avatar
                                    src={store.user?.image || undefined}
                                    icon={!store.user?.image ? <UserOutlined /> : undefined}
                                    className={style.userAvatar}
                                />
                            </div>
                        </Dropdown>
                    </div>

                    {/* Bottom Navigation */}
                    <div className={style.mobileNavContainer}>
                        <div className={style.mobileNav}>
                            <Menu theme="dark" mode="horizontal" selectedKeys={selectedKeys} className={style.menu}>
                                {/* Home Item */}
                                <Menu.Item key="home" data-menu-id="home" data-label={t('common.home')}>
                                    <NavLink to={homeRoute}>
                                        <HomeTwoTone twoToneColor={selectedKeys.includes('home') ? '#1890ff' : '#bfbfbf'} className={style.icon} />
                                    </NavLink>
                                </Menu.Item>

                                {/* Show all navigation items in bottom nav when logged in */}
                                {isLoggedIn && (
                                    <>
                                        <Menu.Item key="checklist" data-label={t('common.checklist')}>
                                            <NavLink to={checklistRoute}>
                                                <CheckCircleTwoTone twoToneColor={selectedKeys.includes('checklist') ? '#1890ff' : '#bfbfbf'} className={style.icon} />
                                            </NavLink>
                                        </Menu.Item>
                                        <Menu.Item key="items" data-label={t('common.storage_plural')}>
                                            <NavLink to={itemsRoute}>
                                                <ProfileTwoTone twoToneColor={selectedKeys.includes('items') ? '#1890ff' : '#bfbfbf'} className={style.icon} />
                                            </NavLink>
                                        </Menu.Item>
                                        {/* Removed 'Neu anlegen' from mobile bottom navbar */}
                                        <Menu.Item key="shopping" data-label={t('common.basket')}>
                                            <NavLink to={basketRoute}>
                                                <Badge offset={[0, 0]} size="small" count={countItems()}>
                                                    <ShoppingTwoTone twoToneColor={selectedKeys.includes('shopping') ? '#1890ff' : '#bfbfbf'} className={style.icon} />
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
