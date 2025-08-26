import axios, { AxiosResponse, Method } from 'axios';
import { useEffect, useState } from 'react';
import '../index.css';
import { baseApiUrl } from '../shared/Constants';
import { Dimension, Setter } from '../types/Types';
import { createApiTimer, formatApiError } from '../utils/apiDebugger';

const api = axios.create({
    baseURL: baseApiUrl,
    timeout: 10000,
});

// Fügt bei jeder Anfrage den Authorization-Header hinzu, falls vorhanden
api.interceptors.response.use(
    response => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            const userData = localStorage.getItem("user");
            if (userData) {
                const user = JSON.parse(userData);
                try {
                    // Neues Token abrufen
                    const refreshResponse = await axios({
                        method: 'POST',
                        url: `${baseApiUrl}/refresh`,
                        headers: { "Authorization": `Bearer ${user.refresh_token}` },
                        timeout: 2000
                    });
                    // Speichere neues Access-Token
                    user.access_token = refreshResponse.data.access_token;
                    localStorage.setItem("user", JSON.stringify(user));

                    // Wiederhole die ursprüngliche Anfrage mit dem neuen Token
                    error.config.headers["Authorization"] = `Bearer ${user.access_token}`;
                    return axios(error.config);
                } catch (refreshError) {
                    console.error("Refresh-Token ungültig", refreshError);
                    localStorage.removeItem("user"); // User ausloggen
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

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

            console.error('StorageAPI Error:', {
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
