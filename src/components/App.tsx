import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import {
    BrowserRouter as Router
} from "react-router-dom";
import Routes from './Routes';
import Layout from './Layout';

function App(): ReactElement {

    return (
        <Router>
            <Layout>
                <Routes />
            </Layout>
        </Router>
    )
}

export default App;
