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
import AdminUsersPage from './admin/AdminUsersPage';
import InvitePage from './invite/InvitePage';
import DeveloperTestingPanel from './debug/DeveloperTestingPanel';
import ProtectedRoute from './auth/ProtectedRoute';
import { adminRoute, adminUsersRoute, adminUserIdRoute, adminUserEditRoute, basketRoute, checklistRoute, devTestingRoute, detailsRouteBase, homeRoute, itemsRoute, loginRoute, newItemRoute, rootRoute, userRoute, resetSuccessRoute, inviteRoute, groupJoinRoute, registerRoute, impressumRoute, privacyRoute } from '../shared/Constants';
import Impressum from './legal/Impressum';
import Privacy from './legal/Privacy';

export default function AppRoutes(): ReactElement {
    return (
        <Routes>
            <Route path={`${itemsRoute}/error/:message`} element={<MyErrorMessage />} />

            {/* Protected Routes - Require Authentication */}
            <Route path={`${itemsRoute}/:id/edit`} element={
                <ProtectedRoute requireAuth={true}>
                    <StorageForm key="edit" />
                </ProtectedRoute>
            } />
            <Route path={newItemRoute} element={
                <ProtectedRoute requireAuth={true}>
                    <StorageForm key="new" />
                </ProtectedRoute>
            } />
            <Route path={`${itemsRoute}/:id`} element={
                <ProtectedRoute requireAuth={true}>
                    <StorageDetail />
                </ProtectedRoute>
            } />
            <Route path={itemsRoute} element={
                <ProtectedRoute requireAuth={true}>
                    <StorageList />
                </ProtectedRoute>
            } />
            <Route path={checklistRoute} element={
                <ProtectedRoute requireAuth={true}>
                    <ChecklistComponent />
                </ProtectedRoute>
            } />
            <Route path={basketRoute} element={
                <ProtectedRoute requireAuth={true}>
                    <Shopping />
                </ProtectedRoute>
            } />
            <Route path={userRoute} element={
                <ProtectedRoute requireAuth={true}>
                    <User />
                </ProtectedRoute>
            } />

            {/* Admin-Only Protected Routes */}
            <Route path={adminRoute} element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdminPage />
                </ProtectedRoute>
            } />
            <Route path={devTestingRoute} element={
                <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <DeveloperTestingPanel />
                </ProtectedRoute>
            } />
            <Route path={adminUsersRoute} element={
                <ProtectedRoute requireAuth={true}>
                    <AdminUsersPage />
                </ProtectedRoute>
            } />
            <Route path={`${adminUsersRoute}/:id`} element={
                <ProtectedRoute requireAuth={true}>
                    <AdminUsersPage />
                </ProtectedRoute>
            } />
            <Route path={`${adminUsersRoute}/:id/edit`} element={
                <ProtectedRoute requireAuth={true}>
                    <AdminUsersPage />
                </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path={resetSuccessRoute} element={<ResetSuccessForm />} />
            <Route path={`${inviteRoute}/:token`} element={<InvitePage />} />
            <Route path={`${groupJoinRoute}/:token`} element={<InvitePage />} />
            <Route path={loginRoute} element={<LoginForm />} />
            <Route path={registerRoute} element={<LoginForm />} />
            <Route path={impressumRoute} element={<Impressum />} />
            <Route path={privacyRoute} element={<Privacy />} />
            <Route path={`${detailsRouteBase}/:category`} element={<NotfallDetail />} />
            <Route path={homeRoute} element={<Home />} />
            <Route path={rootRoute} element={<Navigate to={homeRoute} replace />} />
        </Routes>
    );
}
