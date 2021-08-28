import axios, { AxiosResponse, Method } from 'axios'
import React, { Dispatch } from 'react'
import { StorageModel } from '../components/storage-components/StorageModel'
import { storageApi, useStorageApi } from '../hooks/StorageApi'
import { baseApiUrl } from '../shared/Constants'
import { Action, AddToShoppingCard } from './Store'

export const actionHandler = (action: Action, callback: React.Dispatch<Action>): void => {
    console.log(action.type === 'REMOVE_FROM_CARD' || action.type === 'ADD_TO_CARD' && action.storeageItem.id)
    switch (action.type) {
        case 'ADD_TO_CARD':
            sendRequest('POST', `/basket`, action, callback)
            break
        // case 'REMOVE_FROM_CARD':
        //     sendRequest('DELETE', `/basket/${action.storeageItem.id}`, action, callback)
        //     break

    }
}

function sendRequest(method: Method, path: string, action: AddToShoppingCard, callback: React.Dispatch<Action>): Promise<void> {

    return axios({ method: method, url: `${baseApiUrl}${path}`, data: action.storeageItem, timeout: 2000 })
        .then((response: AxiosResponse) => {
            if (response.config.method === 'POST' || response.config.method === 'PUT') {
                const newAction = { ...action, storeageItem: response.data }
                callback(newAction)
            }
        })
}
