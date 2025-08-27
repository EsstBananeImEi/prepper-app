import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import './i18n';

const container = document.getElementById('root');

if (container) {
    // Erstelle einen Root-Knoten mit der neuen API
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
