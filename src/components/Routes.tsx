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
import DeveloperTestingPanel from './debug/DeveloperTestingPanel';
import ProtectedRoute from './auth/ProtectedRoute';

export default function AppRoutes(): ReactElement {
    return (
        <Routes>
            <Route path="/items/error/:message" element={<MyErrorMessage />} />

            {/* Protected Routes - Require Authentication */}
            <Route path="/items/:id/edit" element={
                <ProtectedRoute requireAuth={true}>
                    <StorageForm key="edit" />
                </ProtectedRoute>
            } />
            <Route path="/items/new" element={
                <ProtectedRoute requireAuth={true}>
                    <StorageForm key="new" />
                </ProtectedRoute>
            } />
            <Route path="/items/:id" element={
                <ProtectedRoute requireAuth={true}>
                    <StorageDetail />
                </ProtectedRoute>
            } />
            <Route path="/items" element={
                <ProtectedRoute requireAuth={true}>
                    <StorageList />
                </ProtectedRoute>
            } />
            <Route path="/checklist" element={
                <ProtectedRoute requireAuth={true}>
                    <ChecklistComponent />
                </ProtectedRoute>
            } />
            <Route path="/basket" element={
                <ProtectedRoute requireAuth={true}>
                    <Shopping />
                </ProtectedRoute>
            } />
            <Route path="/user" element={
                <ProtectedRoute requireAuth={true}>
                    <User />
                </ProtectedRoute>
            } />

            {/* Admin-Only Protected Routes */}
            <Route path="/admin" element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdminPage />
                </ProtectedRoute>
            } />
            <Route path="/dev-testing" element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <DeveloperTestingPanel />
                </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="/resetSuccess" element={<LoginForm />} />
            <Route path="/invite/:token" element={<InvitePage />} />
            <Route path="/groups/join/:token" element={<InvitePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<LoginForm />} />
            <Route path="/details/:category" element={<NotfallDetail />} />
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
