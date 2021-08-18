import React, { ReactElement } from 'react'
import NavBar from './navbar-component/NavBar'
import { Layout as AntdLayout, Menu, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';


interface Props {
    children: ReactElement
}

export default function Layout(props: Props): ReactElement {
    const { Header, Content, Footer } = AntdLayout;
    return (
        <AntdLayout className="layout" style={{ height: 'auto', minHeight: '100%' }}>
            <NavBar />
            <Content style={{ padding: '10px 10px' }}>
                <Breadcrumb separator=">">
                </Breadcrumb>
                {props.children}
            </Content>
            <Footer style={{ textAlign: 'center' }}>Prepper App ©2021 Created by Sebastian Meine</Footer>
        </AntdLayout>
    )
}
