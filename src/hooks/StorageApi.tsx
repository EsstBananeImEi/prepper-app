import { AxiosResponse, Method } from 'axios';
import { useEffect, useState } from 'react';
import '../index.css';
import { baseApiUrl } from '../shared/Constants';
import { Dimension, Setter } from '../types/Types';
import { createApiTimer, formatApiError } from '../utils/apiDebugger';
import createSecureApiClient from '../utils/secureApiClient';
import logger from '../utils/logger';
// Use the shared secure API client with interceptor de-dup and refresh
const api = createSecureApiClient();
export default api;

// Enhanced storageApi with debugging and better error handling
export function storageApi<T>(method: Method, path: string, callback: Setter<T>, data = {}): Promise<void> {
    const timer = createApiTimer(method, path);

    return api({ method, url: path, data })
        .then((response: AxiosResponse) => {
            timer.finish(response.status);
            callback(response.data);
        })
        .catch(error => {
            const errorMessage = formatApiError(error);
            timer.finish(error.response?.status, errorMessage);

            logger.error('StorageAPI Error:', {
                method,
                path,
                error: errorMessage,
                status: error.response?.status,
                data: error.response?.data
            });

            return Promise.reject(error);
        });
}

// Custom Hook: useStorageApi
export function useStorageApi<T>(method: Method, path: string): [T | undefined, Setter<T>, Promise<void> | undefined] {
    const [state, setState] = useState<T>();
    const [axiosPromise, setAxiosPromise] = useState<Promise<void>>();

    useEffect(() => {
        if (!path.trim()) return;
        setAxiosPromise(storageApi(method, path, setState));
    }, [method, path]);

    return [state, setState, axiosPromise];
}

// Custom Hook: useDimensions (umbenannt von useDemensions)
// Ermittelt und liefert die aktuelle Fenstergröße
export function useDemensions(func: (page: number) => void, currentPage: number): [Dimension, Setter<Dimension>] {
    const [state, setState] = useState({
        height: window.innerHeight,
        width: window.innerWidth,
    });

    // Install listeners once; respond to both resize and orientationchange
    useEffect(() => {
        const handleResize = () => {
            setState({
                height: window.innerHeight,
                width: window.innerWidth,
            });
        };

        // Initial measure
        handleResize();

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize as EventListener);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize as EventListener);
        };
    }, []);

    // Allow caller to react to page changes explicitly, without causing re-renders on every render
    useEffect(() => {
        try { func(currentPage); } catch { /* noop */ }
    }, [currentPage, func]);

    return [state, setState];
}
