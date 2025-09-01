import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiDebugger } from './apiDebugger';
import { baseApiUrl, validateAdminApi, authRefreshApi, adminUsersApi, adminUserIdApi } from '../shared/Constants';

// Enhanced API interceptor with admin validation
type RequestHeaders = Record<string, unknown> | undefined;
interface AugmentedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _startedAt?: number;
    _requestData?: unknown;
    _requestHeaders?: RequestHeaders;
}

export const createSecureApiClient = () => {
    const api = axios.create({
        baseURL: baseApiUrl,
        timeout: 10000,
    });

    // Global refresh state to avoid duplicate refresh calls
    let isRefreshing = false;
    let refreshPromise: Promise<string> | null = null;
    const refreshSubscribers: Array<(token: string) => void> = [];
    const subscribeTokenRefresh = (cb: (token: string) => void) => refreshSubscribers.push(cb);
    const onRefreshed = (token: string) => {
        while (refreshSubscribers.length) {
            const cb = refreshSubscribers.shift();
            try { cb && cb(token); } catch { /* noop */ }
        }
    };

    // Request interceptor - add auth token
    api.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.access_token) {
                        config.headers.Authorization = `Bearer ${user.access_token}`;
                    }
                } catch (error) {
                    console.error('Invalid user data in localStorage:', error);
                    localStorage.removeItem('user');
                }
            }
            // Attach a start time and snapshot of request payload/headers for logging
            const cfg = config as AugmentedAxiosRequestConfig;
            cfg._startedAt = Date.now();
            cfg._requestData = config.data as unknown;
            cfg._requestHeaders = { ...(config.headers || {}) } as RequestHeaders;
            return cfg;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor - handle auth failures
    api.interceptors.response.use(
        (response: AxiosResponse) => {
            try {
                const cfg = (response.config || {}) as AugmentedAxiosRequestConfig;
                const startedAt: number | undefined = cfg._startedAt;
                const duration = typeof startedAt === 'number' ? Date.now() - startedAt : undefined;
                apiDebugger.logRequest({
                    timestamp: new Date().toISOString(),
                    method: (response.config?.method || 'GET').toUpperCase(),
                    url: response.config?.url || '',
                    status: response.status,
                    duration,
                    requestData: cfg._requestData,
                    responseData: response.data,
                    requestHeaders: cfg._requestHeaders,
                    responseHeaders: (response.headers as unknown as Record<string, unknown>) || undefined,
                });
            } catch { /* noop */ }
            return response;
        },
        async (error: AxiosError) => {
            const originalRequest = error.config as AugmentedAxiosRequestConfig & { _retry?: boolean };

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                const userData = localStorage.getItem('user');
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (user.refresh_token) {
                            // If already refreshing, queue this request until it's done
                            if (isRefreshing && refreshPromise) {
                                return new Promise((resolve, reject) => {
                                    subscribeTokenRefresh((newToken) => {
                                        try {
                                            if (originalRequest.headers) {
                                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                            }
                                            resolve(api(originalRequest));
                                        } catch (e) { reject(e); }
                                    });
                                });
                            }

                            // Start refresh
                            isRefreshing = true;
                            refreshPromise = axios
                                .post(`${baseApiUrl}${authRefreshApi}`, {}, {
                                    headers: { Authorization: `Bearer ${user.refresh_token}` }
                                })
                                .then((refreshResponse) => {
                                    const newAccess = refreshResponse.data.access_token as string | undefined;
                                    if (!newAccess) throw new Error('No access_token in refresh response');
                                    const newRefresh = refreshResponse.data.refresh_token as string | undefined;
                                    const sessionExp = refreshResponse.data.session_exp as number | undefined;
                                    const updatedUser = {
                                        ...user,
                                        access_token: newAccess,
                                        // Wenn Rotation aktiv ist, Refresh-Token aktualisieren
                                        ...(newRefresh ? { refresh_token: newRefresh } : {}),
                                        ...(sessionExp ? { session_exp: sessionExp } : {})
                                    };
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                    onRefreshed(newAccess);
                                    return newAccess;
                                })
                                .catch((err) => {
                                    throw err;
                                })
                                .finally(() => {
                                    isRefreshing = false;
                                    refreshPromise = null;
                                });

                            try {
                                const newToken = await refreshPromise;
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                }
                                return api(originalRequest);
                            } catch (refreshError) {
                                console.error('Token refresh failed:', refreshError);
                            }
                        }
                    } catch (parseError) {
                        console.error('Invalid user data in localStorage during refresh:', parseError);
                    }
                }

                // If refresh failed or no refresh token, clear user and redirect to login
                localStorage.removeItem('user');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }

            try {
                const cfg = (error.config || {}) as AugmentedAxiosRequestConfig;
                const startedAt: number | undefined = cfg._startedAt;
                const duration = typeof startedAt === 'number' ? Date.now() - startedAt : undefined;
                apiDebugger.logRequest({
                    timestamp: new Date().toISOString(),
                    method: (error.config?.method || 'GET').toUpperCase(),
                    url: error.config?.url || '',
                    status: error.response?.status,
                    duration,
                    error: (error.response?.data as unknown as { error?: string })?.error || error.message,
                    requestData: cfg._requestData,
                    responseData: error.response?.data,
                    requestHeaders: cfg._requestHeaders,
                    responseHeaders: (error.response?.headers as unknown as Record<string, unknown>) || undefined,
                });
            } catch { /* noop */ }
            return Promise.reject(error);
        }
    );

    return api;
};

// Admin-specific API calls with enhanced security
export const adminApi = {
    // Validate admin status (server-side)
    validateAdmin: async (): Promise<{ isAdmin: boolean; user?: unknown }> => {
        const api = createSecureApiClient();
        const response = await api.get(validateAdminApi);
        return response.data;
    },
    // Users management (admin only)
    listUsers: async (): Promise<Array<{ id: number; username: string; email: string; isAdmin?: boolean; isManager?: boolean; locked?: boolean; persons?: number }>> => {
        const api = createSecureApiClient();
        const response = await api.get(adminUsersApi);
        return response.data;
    },
    deleteUser: async (userId: number | string): Promise<void> => {
        const api = createSecureApiClient();
        await api.delete(adminUserIdApi(userId));
    },
    setAdmin: async (userId: number | string, isAdmin: boolean): Promise<void> => {
        const api = createSecureApiClient();
        await api.patch(adminUserIdApi(userId), { isAdmin });
    },
    setManager: async (userId: number | string, isManager: boolean): Promise<void> => {
        const api = createSecureApiClient();
        await api.patch(adminUserIdApi(userId), { isManager });
    },
    setLocked: async (userId: number | string, locked: boolean): Promise<void> => {
        const api = createSecureApiClient();
        await api.patch(adminUserIdApi(userId), { locked });
    },
    updateEmail: async (userId: number | string, email: string): Promise<void> => {
        const api = createSecureApiClient();
        await api.patch(adminUserIdApi(userId), { email });
    }
};

// Auth API helpers
export const authApi = {
    // Revoke the current refresh token server-side
    logout: async (): Promise<void> => {
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) as { refresh_token?: string } : null;
        const refresh = user?.refresh_token;
        if (!refresh) return; // nothing to revoke
        await axios.post(`${baseApiUrl}/logout`, {}, { headers: { Authorization: `Bearer ${refresh}` } });
    }
};

export default createSecureApiClient;
