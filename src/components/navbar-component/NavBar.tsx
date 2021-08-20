import { Layout, Menu } from 'antd';
import React, { ReactElement } from 'react'
import { Link } from "react-router-dom";
import {
    HomeOutlined
} from '@ant-design/icons';

export default function NavBar(): ReactElement {
    const { Header } = Layout;

    return (
        <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                <Menu.Item key='home' style={{ alignItems: 'center', minWidth: '90px' }}>
                    <Link to="/home">
                        <HomeOutlined /> {' '}
                        {/* <span className="nav-text">Home</span> */}
                        <span className="nav-text">Home</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key='storage'>
                    <Link to="/storeditems">
                        <span className="nav-text">Storage</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key='newItem'>
                    <Link to="/storeditems/new">
                        <span className="nav-text">Add Item</span>
                    </Link>
                </Menu.Item>
            </Menu>
        </Header>
    )
}