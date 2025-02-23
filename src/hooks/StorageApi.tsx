import axios, { AxiosResponse, Method } from 'axios';
import { useEffect, useState } from 'react';
import '../index.css';
import { baseApiUrl } from '../shared/Constants';
import { Dimension, Setter } from '../types/Types';
import { data } from 'react-router';

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
                    console.log("Axios-Error:", refreshResponse);
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

// storageApi: Führt eine API-Anfrage aus und übergibt das Ergebnis an den Callback
export function storageApi<T>(method: Method, path: string, callback: Setter<T>, data = {}): Promise<void> {
    console.log("StorageApi triggered:", method, path, data);
    return api({ method, url: path, data })
        .then((response: AxiosResponse) => {
            console.log("StorageApi response:", response.data);
            callback(response.data);
        }).catch(error => {
            console.error("StorageApi error:", error);
        });
}

// bingImageSearchApi: Führt eine Anfrage an die Bing-Image-Suche durch und gibt die Daten an den Callback
export function bingImageSearchApi<T>(searchString: string, callback: Setter<T>): Promise<void> {
    const baseUrl = 'https://bing-image-search1.p.rapidapi.com/images/search';
    return axios({
        method: 'GET',
        url: baseUrl,
        params: { q: searchString },
        timeout: 10000,
        headers: {
            'x-rapidapi-host': 'bing-image-search1.p.rapidapi.com',
            'x-rapidapi-key': 'c057980750msh897e5de14163b88p153743jsn2929c77da6b8'
        }
    })
        .then((response: AxiosResponse) => {
            callback(response.data);
        })
        .catch(error => {
            console.error("Bing Image Search error:", error);
        });
}

// Custom Hook: useBingImageSearchApi
export function useBingImageSearchApi<T>(searchString: string): [T | undefined, Setter<T>, Promise<void> | undefined] {
    const [state, setState] = useState<T>();
    const [axiosPromise, setAxiosPromise] = useState<Promise<void>>();

    useEffect(() => {
        setAxiosPromise(bingImageSearchApi(searchString, setState));
    }, [searchString]);

    return [state, setState, axiosPromise];
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
        width: window.innerWidth
    })

    useEffect(() => {
        function handleResize() {
            setState({
                height: window.innerHeight,
                width: window.innerWidth
            })
        }

        func(currentPage)
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    })
    return [state, setState]
}
