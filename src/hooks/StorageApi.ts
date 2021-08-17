import axios, { AxiosError, AxiosResponse, Method } from 'axios';
import { useEffect, useState } from 'react';
import '../index.css';
import { Setter } from '../types/Types';

export function storageApi<T>(method: Method, path: string, callback: Setter<T>, data = {}): void {

    const baseUrl = 'http://192.168.2.68:3004'

    axios({ method: method, url: `${baseUrl}${path}`, data })
        .then((response: AxiosResponse) => {
            callback(response.data)
        })
}

export function useStorageApi<T>(method: Method, path: string): [T | undefined, Setter<T>] {
    const [state, setState] = useState<T>()

    useEffect(() => {
        storageApi(method, path, setState)
    }, [method, path]);

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