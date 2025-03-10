import {
    HomeOutlined,
    PlusOutlined,
    UnorderedListOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined,
    CheckSquareOutlined
} from '@ant-design/icons';
import { Badge, Layout, Menu, Avatar, Dropdown, Card, Typography } from 'antd';
import React, { ReactElement, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDemensions } from '../../hooks/StorageApi';
import { homeRoute, basketRoute, itemsRoute, newItemRoute, userApi, loginApi, checklistRoute } from '../../shared/Constants';
import logo from '../../static/images/prepper-app.svg';
import { useStore } from '../../store/Store';
import style from './NavBar.module.css';

const { Text } = Typography;

export default function NavBar(): ReactElement {
    const { Header } = Layout;
    const [dimensions] = useDemensions(() => 1, 0);
    const location = useLocation();
    const { store, dispatch } = useStore();
    const navigate = useNavigate();
    const isLoggedIn = !!store.user;
    const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

    useEffect(() => {
        setSelectedKeys(getSelectedKeysDesktop());
    }, [location.pathname]);

    const getSelectedKeysDesktop = (): string[] => {
        if (isLoggedIn && location.pathname === homeRoute) return ['home'];
        if (location.pathname === itemsRoute) return ['items'];
        if (location.pathname === newItemRoute) return ['newItem'];
        if (location.pathname === basketRoute) return ['shopping'];
        if (location.pathname === checklistRoute) return ['checklist'];
        if (location.pathname === userApi || location.pathname === loginApi) return ['auth'];
        return [];
    };

    const countItems = () => store.shoppingCard.length;

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
                                <NavLink to={itemsRoute}>Storage</NavLink>
                            </Menu.Item>
                            <Menu.Item key="newItem">
                                <NavLink to={newItemRoute}>Add Item</NavLink>
                            </Menu.Item>
                            <Menu.Item key="checklist">
                                <NavLink to={checklistRoute}>Checkliste</NavLink>
                            </Menu.Item>
                            <Menu.Item key="shopping">
                                <NavLink to={basketRoute}>
                                    <Badge offset={[5, -5]} size="small" count={countItems()}>
                                        <span className="nav-text">Basket</span>
                                    </Badge>
                                </NavLink>
                            </Menu.Item>
                        </Menu>
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
                <div className={style.mobileNav}>
                    <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKeysDesktop()} className={style.menu}>
                        <Menu.Item key="home">
                            <NavLink to={homeRoute}>
                                <HomeOutlined className={style.icon} />
                            </NavLink>
                        </Menu.Item>
                        {isLoggedIn && (
                            <>
                                <Menu.Item key="checklist">
                                    <NavLink to={checklistRoute}>
                                        <CheckSquareOutlined className={style.icon} />
                                    </NavLink>
                                </Menu.Item>
                                <Menu.Item key="items">
                                    <NavLink to={itemsRoute}>
                                        <UnorderedListOutlined className={style.icon} />
                                    </NavLink>
                                </Menu.Item>
                                <Menu.Item key="newItem">
                                    <NavLink to={newItemRoute}>
                                        <PlusOutlined className={style.icon} />
                                    </NavLink>
                                </Menu.Item>
                                <Menu.Item key="shopping">
                                    <NavLink to={basketRoute}>
                                        <Badge offset={[0, 0]} size="small" count={countItems()}>
                                            <ShoppingCartOutlined className={style.icon} />
                                        </Badge>
                                    </NavLink>
                                </Menu.Item>
                            </>
                        )}
                    </Menu>
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
            )}
        </Header>
    );
}
