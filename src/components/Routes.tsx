import { ReactElement } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './home-component/Home';
import MyErrorMessage from './my-error-component/MyErrorMessage';
import Shopping from './storage-components/shopping-card/Shopping';
import StorageList from './storage-components/storage-list/StorageList';
import StorageForm from './storage-components/storage-form/StorageForm';
import StorageDetail from './storage-components/storage-detail/StorageDetail';
import NotfallDetail from './home-component/notfall-detail-component/NotfallDetail';
import LoginForm from './user-component/login-form/LoginForm';
import User from './user-component/user-Form/UserForm';
import ChecklistComponent from './checklist-component/CheckListItem';
import ResetSuccessForm from './user-component/reset-form/ResetSuccessForm';
import AdminPage from './admin/AdminPage';
import InvitePage from './invite/InvitePage';

export default function AppRoutes(): ReactElement {
    return (
        <Routes>
            <Route path="/items/error/:message" element={<MyErrorMessage />} />
            <Route path="/items/:id/edit" element={<StorageForm key="edit" />} />
            <Route path="/resetSuccess" element={<LoginForm />} />
            <Route path="/items/new" element={<StorageForm key="new" />} />
            <Route path="/items/:id" element={<StorageDetail />} />
            <Route path="/invite/:token" element={<InvitePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/user" element={<User />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/items" element={<StorageList />} />
            <Route path="/checklist" element={<ChecklistComponent />} />
            <Route path="/details/:category" element={<NotfallDetail />} />
            <Route path="/basket" element={<Shopping />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
