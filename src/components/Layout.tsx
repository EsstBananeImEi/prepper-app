import { Breadcrumb, Layout as AntdLayout } from 'antd';
import React, { ReactElement } from 'react';
import { useStorageApi } from '../hooks/StorageApi';
import { useStore } from '../store/Store';
import LoadingSpinner from './loading-spinner/LoadingSpinner';
import NavBar from './navbar-component/NavBar';
import { StorageModel } from './storage-components/StorageModel';


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
            <Footer style={{ textAlign: 'center', padding: '0' }}>Prepper App ©2021 Created by Sebastian Meine</Footer>
        </AntdLayout>
    )
}
