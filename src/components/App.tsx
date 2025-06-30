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
import ErrorBoundary from './error-boundary/ErrorBoundary';
import { usePerformanceMonitoring, useMemoryMonitoring } from '../hooks/usePerformance';

function App(): ReactElement {
    // Performance-Monitoring in Development
    usePerformanceMonitoring();
    useMemoryMonitoring();

    return (
        <ErrorBoundary>
            <StoreProvider>
                <Router>
                    <ScrollToTop />
                    <HideRoutes />
                    <Layout>
                        <Routes />
                    </Layout>
                </Router>
            </StoreProvider>
        </ErrorBoundary>
    )
}

export default App;
