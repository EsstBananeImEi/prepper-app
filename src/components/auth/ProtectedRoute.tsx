import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, Alert, Spin } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useStore } from '../../store/Store';
import { baseApiUrl, validateAdminApi } from '../../shared/Constants';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
    fallbackPath?: string;
}

interface AuthValidationResponse {
    isValid: boolean;
    isAdmin: boolean;
    user?: {
        id: number;
        email: string;
        username: string;
        isAdmin: boolean;
    };
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = false,
    requireAdmin = false,
    fallbackPath = '/login'
}) => {
    const { store } = useStore();
    const location = useLocation();
    const { t } = useTranslation();
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        isAuthenticated: boolean;
        isAuthorized: boolean;
        isAdmin: boolean;
        error?: string;
    } | null>(null);

    // Client-side initial checks
    const hasToken = !!store.user?.access_token;
    const clientSideIsAdmin = store.user?.isAdmin ?? false;

    useEffect(() => {
        const validateUserAuth = async () => {
            // Skip validation if no authentication is required
            if (!requireAuth && !requireAdmin) {
                setValidationResult({
                    isAuthenticated: true,
                    isAuthorized: true,
                    isAdmin: false
                });
                return;
            }

            // If no token, user is definitely not authenticated
            if (!hasToken) {
                setValidationResult({
                    isAuthenticated: false,
                    isAuthorized: false,
                    isAdmin: false,
                    error: t('auth.protected.notLoggedIn')
                });
                return;
            }

            setIsValidating(true);

            try {
                // Server-side validation of token and admin status
                const response = await fetch(validateAdminApi, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${store.user?.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result: AuthValidationResponse = await response.json();

                    const isAuthenticated = result.isValid;
                    const isAdmin = result.isAdmin;
                    const isAuthorized = requireAdmin ? isAdmin : isAuthenticated;

                    setValidationResult({
                        isAuthenticated,
                        isAuthorized,
                        isAdmin,
                        error: !isAuthorized ? (requireAdmin ? t('auth.protected.adminRequired') : t('auth.protected.unauthorized')) : undefined
                    });
                } else if (response.status === 401) {
                    // Token is invalid or expired
                    setValidationResult({
                        isAuthenticated: false,
                        isAuthorized: false,
                        isAdmin: false,
                        error: t('auth.protected.sessionExpired')
                    });

                    // Clear invalid user data
                    localStorage.removeItem('user');
                } else {
                    throw new Error(`Validation failed: ${response.status}`);
                }
            } catch (error) {
                console.error('Auth validation failed:', error);

                // Fallback: If server validation fails, deny access for admin routes
                if (requireAdmin) {
                    setValidationResult({
                        isAuthenticated: false,
                        isAuthorized: false,
                        isAdmin: false,
                        error: t('auth.protected.serverValidationFailed')
                    });
                } else {
                    // For non-admin routes, allow client-side token check as fallback
                    setValidationResult({
                        isAuthenticated: hasToken,
                        isAuthorized: hasToken,
                        isAdmin: false,
                        error: hasToken ? undefined : t('auth.protected.notLoggedIn')
                    });
                }
            } finally {
                setIsValidating(false);
            }
        };

        validateUserAuth();
    }, [hasToken, requireAuth, requireAdmin, store.user?.access_token]);

    // Show loading spinner during validation
    if (isValidating) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // If validation hasn't completed yet, show loading
    if (validationResult === null) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // Redirect if not authenticated (when auth is required)
    if (requireAuth && !validationResult.isAuthenticated) {
        return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    // Show access denied for admin routes when user is authenticated but not admin
    if (requireAdmin && validationResult.isAuthenticated && !validationResult.isAuthorized) {
        return (
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                <Card>
                    <Alert
                        message={t('auth.protected.accessDeniedTitle')}
                        description={
                            <div>
                                <p>
                                    <LockOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                    {t('auth.protected.accessDeniedBody1')}
                                </p>
                                <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                                    <strong>Sicherheitshinweis:</strong> {t('auth.protected.securityNote')}
                                </p>
                            </div>
                        }
                        type="error"
                        showIcon
                        icon={<UserOutlined />}
                        style={{ textAlign: 'center' }}
                    />
                </Card>
            </div>
        );
    }

    // Redirect if not authorized
    if (!validationResult.isAuthorized) {
        return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    // Render protected content
    return <>{children}</>;
};

export default ProtectedRoute;
