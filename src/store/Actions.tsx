import axios, { AxiosResponse, Method } from 'axios';
import { baseApiUrl, itemsRoute, nutrientsApi } from '../shared/Constants';
import { Action, AddToShoppingCard, IncreaseAmount, DecreaseAmount, ClearItemCard, LoginUser, RegisterUser, EditUser, IncreaseStorageItem, DecreaseStorageItem, AddStorageItem, DeleteStorageItem, UpdateStorageItem, UpdateNutrientItem, UpdateCardItem } from './Store';

export const actionHandler = (action: Action, callback: React.Dispatch<Action>): Promise<void> => {
    console.log('actionHandler', action);
    switch (action.type) {
        case 'ADD_TO_CARD':
            return sendRequest('POST', `/basket`, action, callback);
        case 'UPDATE_CARD_ITEM':
            return sendRequest('PUT', `/basket/${action.basketItems.id}`, action, callback);
        case 'DECREASE_AMOUNT':
        case 'INCREASE_AMOUNT':
            return sendRequest('PUT', `/basket/${action.basketItems.id}`, action, callback);
        case 'CLEAR_ITEM_CARD':
            console.log("Clear Item Card:", action.basketItems);
            return sendRequest('DELETE', `/basket/${action.basketItems.id}`, action, callback);
        case 'LOGIN_USER':
            return sendUserRequest('POST', `/login`, action, callback);
        case 'REGISTER_USER':
            return sendUserRequest('POST', `/register`, action, callback);
        case 'EDIT_USER':
            return sendUserRequest('PUT', `/user`, action, callback);
        case 'INCREASE_STORAGE_ITEM':
        case 'DECREASE_STORAGE_ITEM':
        case 'UPDATE_STORAGE_ITEM':
            return sendStorageRequest('PUT', `${itemsRoute}/${action.storageItem.id}`, action, callback);
        case 'UPDATE_NUTRIENT_ITEM':
            return sendNutrientRequest('PUT', `${nutrientsApi(action.storageItem.id)}`, action, callback);
        case 'DELETE_STORAGE_ITEM':
            return sendStorageRequest('DELETE', `${itemsRoute}/${action.storageItem.id}`, action, callback);
        case 'ADD_STORAGE_ITEM':
            return sendStorageRequest('POST', `${itemsRoute}`, action, callback);
        default:
            return Promise.resolve();
    }
};

function sendRequest(
    method: Method,
    path: string,
    action: AddToShoppingCard | DecreaseAmount | IncreaseAmount | ClearItemCard | UpdateCardItem,
    callback: React.Dispatch<Action>
): Promise<void> {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    console.log('sendRequest', action);
    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: { ...action.basketItems, id: 0 },
        timeout: 6000,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
        .then((response: AxiosResponse) => {
            console.log('sendRequest response', response);
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put') {
                action = { ...action, basketItems: response.data };
            }
            callback(action);
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}

function sendStorageRequest(
    method: Method,
    path: string,
    action: AddStorageItem | IncreaseStorageItem | DecreaseStorageItem | DeleteStorageItem | UpdateStorageItem,
    callback: React.Dispatch<Action>
): Promise<void> {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: { ...action.storageItem, id: 0 },
        timeout: 3500,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
        .then((response: AxiosResponse) => {
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put') {
                action = { ...action, storageItem: response.data };
            }
            callback(action);
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}


function sendNutrientRequest(
    method: Method,
    path: string,
    action: UpdateNutrientItem,
    callback: React.Dispatch<Action>
): Promise<void> {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: { ...action.storageItem.nutrients },
        timeout: 3500,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
        .then((response: AxiosResponse) => {
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put') {
                action = { ...action, storageItem: response.data };
            }
            callback(action);
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}

function sendUserRequest(
    method: Method,
    path: string,
    action: LoginUser | RegisterUser | EditUser,
    callback: React.Dispatch<Action>
): Promise<void> {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: { ...action.user },
        timeout: 3500,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
        .then((response: AxiosResponse) => {
            action = { ...action, user: response.data };
            callback(action);
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}
