import { Breadcrumb, Layout as AntdLayout, Button } from 'antd';
import { Link } from 'react-router-dom';
import { impressumRoute, privacyRoute } from '../shared/Constants';
import React, { ReactElement, useState } from 'react';
import { BugOutlined } from '@ant-design/icons';
import NavBar from './navbar-component/NavBar';
import BreadcrumbNav from './breadcrumb/BreadcrumbNav';
import ApiDebugPanel from './debug/ApiDebugPanel';
import PoliciesGate from './legal/PoliciesGate';
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
                <PoliciesGate />
                {props.children}
            </Content>



            <Footer className={styles.footer}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Prepper App ©{new Date().getFullYear()} Created by Sebastian Meine</span>
                    <span>·</span>
                    <Link to={impressumRoute}>Impressum</Link>
                    <span>·</span>
                    <Link to={privacyRoute}>Datenschutz</Link>
                </div>
            </Footer>
        </AntdLayout>
    )
}
