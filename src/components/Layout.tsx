import { Breadcrumb, Layout as AntdLayout, Button } from 'antd';
import React, { ReactElement, useState } from 'react';
import { BugOutlined } from '@ant-design/icons';
import NavBar from './navbar-component/NavBar';
import BreadcrumbNav from './breadcrumb/BreadcrumbNav';
import ApiDebugPanel from './debug/ApiDebugPanel';


interface Props {
    children: ReactElement
}

export default function Layout(props: Props): ReactElement {
    const { Header, Content, Footer } = AntdLayout;
    const [debugPanelVisible, setDebugPanelVisible] = useState(false);

    return (
        <AntdLayout className="layout" style={{ height: 'auto', minHeight: '100%' }}>
            <NavBar />
            <Content style={{ padding: '10px 10px' }}>
                <BreadcrumbNav />
                {props.children}
            </Content>

            {/* Debug Panel for development */}
            {process.env.NODE_ENV === 'development' && (
                <>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<BugOutlined />}
                        size="large"
                        onClick={() => setDebugPanelVisible(true)}
                        style={{
                            position: 'fixed',
                            bottom: 20,
                            right: 20,
                            zIndex: 1000,
                            backgroundColor: '#722ed1',
                            borderColor: '#722ed1'
                        }}
                        title="API Debug Panel"
                    />
                    <ApiDebugPanel
                        visible={debugPanelVisible}
                        onClose={() => setDebugPanelVisible(false)}
                    />
                </>
            )}

            <Footer style={{ textAlign: 'center', padding: '0' }}>Prepper App ©{new Date().getFullYear()} Created by Sebastian Meine</Footer>
        </AntdLayout>
    )
}
