import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { baseApiUrl } from '../shared/Constants';

// Enhanced API interceptor with admin validation
export const createSecureApiClient = () => {
    const api = axios.create({
        baseURL: baseApiUrl,
        timeout: 10000,
    });

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
                            // Try to refresh token
                            const refreshResponse = await axios.post(`${baseApiUrl}/auth/refresh`, {}, {
                                headers: { Authorization: `Bearer ${user.refresh_token}` }
                            });

                            if (refreshResponse.data.access_token) {
                                // Update stored user data
                                const updatedUser = {
                                    ...user,
                                    access_token: refreshResponse.data.access_token
                                };
                                localStorage.setItem('user', JSON.stringify(updatedUser));

                                // Retry original request with new token
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
                                }
                                return api(originalRequest);
                            }
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                    }
                }

                // If refresh failed, clear user data and redirect to login
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
    validateAdmin: async (): Promise<{ isAdmin: boolean; user?: any }> => {
        const api = createSecureApiClient();
        const response = await api.get('/auth/validate-admin');
        return response.data;
    },

    // Get admin dashboard data
    getDashboardData: async (): Promise<any> => {
        const api = createSecureApiClient();
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    // Admin-only user management
    getUsers: async (): Promise<any[]> => {
        const api = createSecureApiClient();
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Admin-only system info
    getSystemInfo: async (): Promise<any> => {
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
