import React, { ReactElement, useEffect } from 'react';
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
import { usePerformanceMonitoring, useMemoryMonitoring } from '../hooks/usePerformance';
import { useInviteProcessor } from '../hooks/useInviteProcessor';
import ErrorBoundary from './error-boundary/ErrorBoundary';

function App(): ReactElement {
    // Performance-Monitoring in Development
    usePerformanceMonitoring();
    useMemoryMonitoring();

    return (
        <ErrorBoundary>
            <StoreProvider>
                <Router>
                    <AppContent />
                </Router>
            </StoreProvider>
        </ErrorBoundary>
    )
}

function AppContent(): ReactElement {
    // Invite Processing für  automatisches Gruppenbeitritt (muss innerhalb Router sein)
    useInviteProcessor();

    // Ensure route changes don't restore previous scroll positions
    useEffect(() => {
        try {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
        } catch {
            // no-op
        }
    }, []);

    return (
        <>
            <ScrollToTop />
            {/* <HideRoutes /> */}
            <Layout>
                <Routes />
            </Layout>
        </>
    );
}

export default App;
