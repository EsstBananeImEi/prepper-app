
import axios, { AxiosError, AxiosResponse, Method } from 'axios';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import MyErrorMessage from '../components/my-error-component/MyErrorMessage';
import '../index.css';
import { Dimension, Setter } from '../types/Types';

export function storageApi<T>(method: Method, path: string, callback: Setter<T>, data = {}): Promise<void> {

    const baseUrl = 'http://192.168.2.68:3004'

    return axios({ method: method, url: `${baseUrl}${path}`, data, timeout: 2000 })
        .then((response: AxiosResponse) => {
            callback(response.data)
        })

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