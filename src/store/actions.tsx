import axios, { AxiosResponse, Method } from 'axios'
import React, { Dispatch } from 'react'
import { StorageModel } from '../components/storage-components/StorageModel'
import { storageApi, useStorageApi } from '../hooks/StorageApi'
import { Action, AddToShoppingCard, RemoveFromShoppingCard } from './Store'

export const actionHandler = (action: Action, callback: React.Dispatch<Action>): void => {
    console.log(action.type === 'REMOVE_FROM_CARD' || action.type === 'ADD_TO_CARD' && action.storeageItem.id)
    switch (action.type) {
        case 'ADD_TO_CARD':
            sendRequest('POST', `/storedItems/${action.storeageItem.id}/basket`, action, callback)
            break
        case 'REMOVE_FROM_CARD':
            sendRequest('DELETE', `/basket/${action.storeageItem.id}`, action, callback)
            break

    }
}

function sendRequest(method: Method, path: string, action: AddToShoppingCard | RemoveFromShoppingCard, callback: React.Dispatch<Action>): Promise<void> {
    const baseUrl = 'http://192.168.2.68:3004'
    const newModel = { ...action.storeageItem, id: 0 }
    return axios({ method: method, url: `${baseUrl}${path}`, data: newModel, timeout: 2000 })
        .then((response: AxiosResponse) => {
            if (response.config.method === 'POST' || response.config.method === 'PUT') {
                const newAction = { ...action, storeageItem: response.data }
                callback(newAction)
            } else {

                callback(action)
            }
        })
}
