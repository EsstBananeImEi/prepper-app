import axios, { AxiosResponse, Method } from 'axios'
import React, { Dispatch } from 'react'
import { baseApiUrl } from '../shared/Constants'
import { Action, AddToShoppingCard, IncreaseAmount, DecreaseAmount, ClearItemCard, LoginUser, RegisterUser } from './Store'

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
            break
        case 'LOGIN_USER':
            sendLoginRequest('POST', `/login`, action, callback)
            break
        case 'REGISTER_USER':
            sendLoginRequest('POST', `/register`, action, callback)
    }
}

function sendRequest(method: Method, path: string, action: AddToShoppingCard | DecreaseAmount | IncreaseAmount | ClearItemCard, callback: React.Dispatch<Action>): Promise<void> {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    console.log("Verwendetes Token:", token);
    return axios({ method: method, url: `${baseApiUrl}${path}`, data: { ...action.storeageItem, id: 0 }, timeout: 2000, headers: token ? { "Authorization": `Bearer ${token}` } : {}, })
        .then((response: AxiosResponse) => {
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put')
                action = { ...action, storeageItem: response.data };

            callback(action);
        })
        .catch(error => {
            console.error("Axios request error:", error);
        });
}

function sendLoginRequest(method: Method, path: string, action: LoginUser | RegisterUser, callback: React.Dispatch<Action>): Promise<void> {
    return axios({ method: method, url: `${baseApiUrl}${path}`, data: { ...action.user }, timeout: 2000 })
        .then((response: AxiosResponse) => {
            action = { ...action, user: response.data };
            callback(action);
        })
        .catch(error => {
            console.error("Axios request error:", error);
        }
        );
}