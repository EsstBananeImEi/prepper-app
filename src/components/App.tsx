import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    BrowserRouter as Router
} from "react-router-dom";
import Routes from './Routes';
import Layout from './Layout';
import { StoreProvider } from '../store/Store';
import ScrollToTop from './ScrollToTop';
import HideRoutes from './HideRoutes';

function App(): ReactElement {

    return (
        <StoreProvider>
            <Router>
                <ScrollToTop />
                <HideRoutes />
                <Layout>
                    <Routes />
                </Layout>
            </Router>
        </StoreProvider >
    )
}

export default App;
