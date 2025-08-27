import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { baseApiUrl, validateAdminApi, authRefreshApi, adminUsersApi, adminUserIdApi } from '../shared/Constants';

// Enhanced API interceptor with admin validation
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
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor - handle auth failures
    api.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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
                                    const newToken = refreshResponse.data.access_token as string | undefined;
                                    if (!newToken) throw new Error('No access_token in refresh response');
                                    const updatedUser = { ...user, access_token: newToken };
                                    localStorage.setItem('user', JSON.stringify(updatedUser));
                                    onRefreshed(newToken);
                                    return newToken;
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

export default createSecureApiClient;
