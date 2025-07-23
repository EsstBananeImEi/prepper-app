import { Breadcrumb, Layout as AntdLayout, Button } from 'antd';
import React, { ReactElement, useState } from 'react';
import { BugOutlined } from '@ant-design/icons';
import NavBar from './navbar-component/NavBar';
import BreadcrumbNav from './breadcrumb/BreadcrumbNav';
import ApiDebugPanel from './debug/ApiDebugPanel';
import styles from './Layout.module.css';


interface Props {
    children: ReactElement
}

export default function Layout(props: Props): ReactElement {
    const { Header, Content, Footer } = AntdLayout;
    const [debugPanelVisible, setDebugPanelVisible] = useState(false);

    return (
        <AntdLayout className={styles.layout}>
            <NavBar />
            <Content className={styles.layoutContent}>
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
                        className={styles.debugButton}
                        title="API Debug Panel"
                    />
                    <ApiDebugPanel
                        visible={debugPanelVisible}
                        onClose={() => setDebugPanelVisible(false)}
                    />
                </>
            )}

            <Footer className={styles.footer}>Prepper App ©{new Date().getFullYear()} Created by Sebastian Meine</Footer>
        </AntdLayout>
    )
}
