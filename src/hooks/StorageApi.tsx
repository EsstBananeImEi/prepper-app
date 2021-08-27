
import axios, { AxiosResponse, Method } from 'axios';
import { useEffect, useState } from 'react';
import '../index.css';
import { Dimension, Setter } from '../types/Types';

export function storageApi<T>(method: Method, path: string, callback: Setter<T>, data = {}): Promise<void> {

    // const baseUrl = 'http://192.168.2.68:3004'
    const baseUrl = 'http://localhost:3004'

    return axios({ method: method, url: `${baseUrl}${path}`, data, timeout: 2000 })
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

// axios.interceptors.response.use(function (response) {
//     if (response.data) {
//         if (!Array.isArray(response.data)) {
//             response.data = factoryRawToBook(response.data)
//         } else if (response.data.every(isBook)) {
//             response.data = response.data.map((book) => factoryRawToBook(book))
//         }
//     }
//     return response;
// }, function (error) {
//     return Promise.reject(error);
// });