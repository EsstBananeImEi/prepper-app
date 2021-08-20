import { Layout, Menu } from 'antd';
import React, { ReactElement } from 'react'
import { Link } from "react-router-dom";
import {
    HomeOutlined,
    PlusOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { useDemensions } from '../../hooks/StorageApi';

export default function NavBar(): ReactElement {
    const { Header } = Layout;
    const [dimensions] = useDemensions(() => 1, 0)


    return (
        <Header>
            {dimensions.width > 600
                ? <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                    <Menu.Item key='home' >
                        <Link to="/home">
                            <span className="nav-text">Home</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='storage' >
                        <Link to="/storeditems">
                            <span className="nav-text">Storage</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='newItem' >
                        <Link to="/storeditems/new">
                            <span className="nav-text">Add Item</span>
                        </Link>
                    </Menu.Item>
                </Menu>
                : <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                    <Menu.Item key='home' style={{ alignItems: 'center', width: '65px' }}>
                        <Link to="/home">
                            <HomeOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='storage' style={{ alignItems: 'center', width: '65px' }}>
                        <Link to="/storeditems">
                            <UnorderedListOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='newItem' style={{ alignItems: 'center', width: '65px' }}>
                        <Link to="/storeditems/new">
                            <PlusOutlined style={{ fontSize: '25px', position: 'relative', top: '5px' }} />
                        </Link>
                    </Menu.Item>
                </Menu>
            }
        </Header>
    )
}