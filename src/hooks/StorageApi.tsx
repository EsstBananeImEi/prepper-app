import axios, { AxiosResponse, Method } from 'axios';
import { useEffect, useState } from 'react';
import '../index.css';
import { baseApiUrl } from '../shared/Constants';
import { Dimension, Setter } from '../types/Types';

export function storageApi<T>(method: Method, path: string, callback: Setter<T>, data = {}): Promise<void> {
    return axios({ method: method, url: `${baseApiUrl}${path}`, data, timeout: 10000 })
        .then((response: AxiosResponse) => {
            callback(response.data)
        })
}

export function bingImageSearchApi<T>(searchString: string, callback: Setter<T>): Promise<void> {
    const baseUrl = 'https://bing-image-search1.p.rapidapi.com/images/search'
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
            callback(response.data)
        })
}

export function useBingImageSearchApi<T>(searchString: string): [T | undefined, Setter<T>, Promise<void> | undefined] {
    const [state, setState] = useState<T>()
    const [axiosPromise, setAxiosPromise] = useState<Promise<void>>()

    useEffect(() => {
        setAxiosPromise(bingImageSearchApi(searchString, setState));
    }, [searchString]);

    return [state, setState, axiosPromise]
}

export function useStorageApi<T>(method: Method, path: string): [T | undefined, Setter<T>, Promise<void> | undefined] {
    const [state, setState] = useState<T>()
    const [axiosPromise, setAxiosPromise] = useState<Promise<void>>()

    useEffect(() => {
        setAxiosPromise(storageApi(method, path, setState));
    }, [method, path]);

    return [state, setState, axiosPromise]
}

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

// Fehlerbehandlung in `StorageDetail.tsx` anpassen
export function handleAxiosError(axiosPromise: Promise<void> | undefined, history: any, errorRoute: (message: string) => string) {
    if (axiosPromise instanceof Promise) {
        axiosPromise.catch((e) => {
            history.push(errorRoute(e.message))
        });
    }
}
