import React, { ReactElement } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './home-component/Home';
import MyErrorMessage from './my-error-component/MyErrorMessage';
import Shopping from './storage-components/shopping-card/Shopping';
import StorageList from './storage-components/storage-list/StorageList';
import StorageForm from './storage-components/storage-form/StorageForm';
import StorageDetail from './storage-components/storage-detail/StorageDetail';

export default function AppRoutes(): ReactElement {
    return (
        <Routes>
            <Route path="/items/error/:message" element={<MyErrorMessage />} />
            <Route path="/items/:id/edit" element={<StorageForm key="edit" />} />
            <Route path="/items/new" element={<StorageForm key="new" />} />
            <Route path="/items/:id" element={<StorageDetail />} />
            <Route path="/items" element={<StorageList />} />
            <Route path="/basket" element={<Shopping />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
