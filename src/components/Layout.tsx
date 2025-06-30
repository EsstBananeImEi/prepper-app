import { Breadcrumb, Layout as AntdLayout } from 'antd';
import React, { ReactElement } from 'react';
import NavBar from './navbar-component/NavBar';
import BreadcrumbNav from './breadcrumb/BreadcrumbNav';


interface Props {
    children: ReactElement
}

export default function Layout(props: Props): ReactElement {
    const { Header, Content, Footer } = AntdLayout;
    return (
        <AntdLayout className="layout" style={{ height: 'auto', minHeight: '100%' }}>
            <NavBar />
            <Content style={{ padding: '10px 10px' }}>
                <BreadcrumbNav />
                {props.children}
            </Content>
            <Footer style={{ textAlign: 'center', padding: '0' }}>Prepper App ©{new Date().getFullYear()} Created by Sebastian Meine</Footer>
        </AntdLayout>
    )
}
