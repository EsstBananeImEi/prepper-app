import axios, { AxiosResponse, Method } from 'axios'
import React, { Dispatch } from 'react'
import { baseApiUrl } from '../shared/Constants'
import { Action, AddToShoppingCard, IncreaseAmount, DeacreaseAmount, ClearItemCard } from './Store'

export const actionHandler = (action: Action, callback: React.Dispatch<Action>): void => {
    console.log("ActionHandler triggered:", action);
    switch (action.type) {
        case 'ADD_TO_CARD':
            sendRequest('POST', `/basket`, action, callback)
            break
        case 'DECREASE_AMOUNT':
        case 'INCREASE_AMOUNT':
            sendRequest('PUT', `/basket/${action.storeageItem.id}`, action, callback)
            break
        case 'CLEAR_ITEM_CARD':
            sendRequest('DELETE', `/basket/${action.storeageItem.id}`, action, callback)
    }
}

function sendRequest(method: Method, path: string, action: AddToShoppingCard | DeacreaseAmount | IncreaseAmount | ClearItemCard, callback: React.Dispatch<Action>): Promise<void> {

    return axios({ method: method, url: `${baseApiUrl}${path}`, data: { ...action.storeageItem, id: 0 }, timeout: 2000 })
        .then((response: AxiosResponse) => {
            console.log("Axios response:", response.data, response.config.method);
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put')
                action = { ...action, storeageItem: response.data };

            console.log("Dispatching action:", action);
            callback(action);
        })
        .catch(error => {
            console.error("Axios request error:", error);
        });
}
