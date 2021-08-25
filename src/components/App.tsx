import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    BrowserRouter as Router
} from "react-router-dom";
import Routes from './Routes';
import Layout from './Layout';
import { StoreProvider } from '../store/Store';

function App(): ReactElement {

    return (
        <StoreProvider>
            <Router>
                <Layout>
                    <Routes />
                </Layout>
            </Router>
        </StoreProvider>
    )
}

export default App;
