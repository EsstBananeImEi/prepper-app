import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import i18n from '../i18n';
import axios from 'axios';
import logger from '../utils/logger';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiOptions<T = unknown> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showNotification?: boolean;
}

/**
 * Enhanced API error handler with better debugging
 */
export function handleApiError(error: unknown, showNotification: boolean = true): string {
    let errorMessage = i18n.t('notifications.apiErrorTitle');
    let debugInfo = '';

    if (axios.isAxiosError(error)) {
        logger.group('🚨 API Error Details');
        logger.error('Status:', error.response?.status);
        logger.error('Status Text:', error.response?.statusText);
        logger.error('URL:', error.config?.url);
        logger.error('Method:', error.config?.method?.toUpperCase());
        logger.error('Headers:', error.config?.headers);
        logger.error('Request Data:', error.config?.data);
        logger.error('Response Data:', error.response?.data);
        logger.groupEnd();

        // Handle specific error cases
        switch (error.response?.status) {
            case 400:
                errorMessage = error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Ungültige Anfrage (400)';
                debugInfo = `URL: ${error.config?.url}, Method: ${error.config?.method?.toUpperCase()}`;
                break;
            case 401:
                errorMessage = i18n.t('auth.protected.unauthorized');
                break;
            case 403:
                errorMessage = i18n.t('auth.protected.accessDeniedTitle');
                break;
            case 404:
                errorMessage = 'Ressource nicht gefunden.';
                break;
            case 422:
                errorMessage = 'Ungültige Daten übermittelt.';
                if (error.response?.data?.errors) {
                    const validationErrors = Object.values(error.response.data.errors).flat();
                    errorMessage += ` Details: ${validationErrors.join(', ')}`;
                }
                break;
            case 500:
                errorMessage = 'Serverfehler. Bitte versuchen Sie es später erneut.';
                break;
            default:
                errorMessage = error.message || `HTTP ${error.response?.status}: ${error.response?.statusText}`;
        }

        // Add debug info for development
        if (process.env.NODE_ENV === 'development' && debugInfo) {
            errorMessage += ` [Debug: ${debugInfo}]`;
        }
    } else if (error instanceof Error) {
        logger.error('Non-Axios Error:', error);
        errorMessage = error.message;
    }

    if (showNotification) {
        notification.error({
            message: i18n.t('notifications.apiErrorTitle'),
            description: errorMessage,
            placement: 'topRight',
            duration: 6
        });
    }

    return errorMessage;
}

export function useApi<T>(
    apiCall: () => Promise<T>,
    dependencies: React.DependencyList = [],
    options: UseApiOptions<T> = {}
): ApiState<T> & { refetch: () => Promise<void> } {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: true,
        error: null
    });

    const { onSuccess, onError, showNotification = false } = options;

    const fetchData = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const data = await apiCall();
            setState({ data, loading: false, error: null });

            onSuccess?.(data);

            if (showNotification) {
                notification.success({
                    message: i18n.t('notifications.apiLoadedTitle'),
                    description: i18n.t('notifications.apiLoadedDesc'),
                    placement: 'topRight',
                    duration: 3
                });
            }
        } catch (error) {
            const errorMessage = handleApiError(error, showNotification);
            setState({ data: null, loading: false, error: errorMessage });
            onError?.(errorMessage);
        }
    };

    useEffect(() => {
        fetchData();
    }, dependencies);

    return {
        ...state,
        refetch: fetchData
    };
}

export function useMutation<T, P>(
    mutationFn: (params: P) => Promise<T>,
    options: UseApiOptions<T> = {}
): {
    mutate: (params: P) => Promise<T | null>;
    loading: boolean;
    error: string | null;
} {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { onSuccess, onError, showNotification = true } = options;

    const mutate = async (params: P): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await mutationFn(params);

            onSuccess?.(result);

            if (showNotification) {
                notification.success({
                    message: i18n.t('notifications.saveSuccessTitle'),
                    description: i18n.t('notifications.saveSuccessDesc'),
                    placement: 'topRight',
                    duration: 3
                });
            }

            setLoading(false);
            return result;
        } catch (error) {
            const errorMessage = handleApiError(error, showNotification);
            setError(errorMessage);
            onError?.(errorMessage);
            setLoading(false);
            return null;
        }
    };

    return { mutate, loading, error };
}
