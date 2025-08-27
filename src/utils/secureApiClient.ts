import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { baseApiUrl } from '../shared/Constants';

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
                                .post(`${baseApiUrl}/auth/refresh`, {}, {
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
        const response = await api.get('/auth/validate-admin');
        return response.data;
    },

    // Get admin dashboard data
    getDashboardData: async (): Promise<unknown> => {
        const api = createSecureApiClient();
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    // Admin-only user management
    getUsers: async (): Promise<unknown[]> => {
        const api = createSecureApiClient();
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Admin-only system info
    getSystemInfo: async (): Promise<unknown> => {
        const api = createSecureApiClient();
        const response = await api.get('/admin/system-info');
        return response.data;
    }
};

// Utility function to check if current request has admin privileges
export const validateAdminRequest = async (): Promise<boolean> => {
    try {
        const result = await adminApi.validateAdmin();
        return result.isAdmin;
    } catch (error) {
        console.error('Admin validation failed:', error);
        return false;
    }
};

export default createSecureApiClient;
