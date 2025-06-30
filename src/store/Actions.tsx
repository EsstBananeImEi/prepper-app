import axios, { AxiosResponse, Method } from 'axios';
import { baseApiUrl, itemsRoute, nutrientsApi } from '../shared/Constants';
import { Action, AddToShoppingCard, IncreaseAmount, DecreaseAmount, ClearItemCard, LoginUser, RegisterUser, EditUser, IncreaseStorageItem, DecreaseStorageItem, AddStorageItem, DeleteStorageItem, UpdateStorageItem, UpdateNutrientItem, UpdateCardItem, ForgotPassword } from './Store';

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
        case 'FORGOT_PASSWORD':
            return sendUserRequest('POST', `/forgot-password`, action, callback);
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

    let requestData: any = { ...action.basketItems };
    if (method === 'POST') {
        const { id, ...dataWithoutId } = requestData;
        requestData = dataWithoutId;
    }

    console.log('🛒 Basket API Request:', { method, path, data: requestData });

    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: requestData,
        timeout: 8000,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
    })
        .then((response: AxiosResponse) => {
            console.log('✅ Basket API Success:', response.data);
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put') {
                action = { ...action, basketItems: response.data };
            }
            callback(action);
        })
        .catch((error) => {
            console.error('❌ Basket API Error:', error.response?.data || error.message);
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

    // Prepare data for API - ensure proper format
    let requestData: any = { ...action.storageItem };

    // For new items, remove ID from request
    if (method === 'POST') {
        const { id, ...dataWithoutId } = requestData;
        requestData = dataWithoutId;
    }

    // Log request details for debugging
    console.group('🌐 Storage API Request');
    console.log('Method:', method);
    console.log('URL:', `${baseApiUrl}${path}`);
    console.log('Data:', requestData);
    console.log('Has Token:', !!token);
    console.groupEnd();

    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: requestData,
        timeout: 10000, // Increased timeout
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
    })
        .then((response: AxiosResponse) => {
            console.log('✅ Storage API Success:', response.data);
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put') {
                action = { ...action, storageItem: response.data };
            }
            callback(action);
        })
        .catch((error) => {
            console.group('❌ Storage API Error');
            console.error('Status:', error.response?.status);
            console.error('Response:', error.response?.data);
            console.error('Request Data:', requestData);
            console.groupEnd();
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
    action: LoginUser | RegisterUser | EditUser | ForgotPassword,
    callback: React.Dispatch<Action>
): Promise<void> {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    const data = action.type === 'FORGOT_PASSWORD' ? { email: action.email } : { ...action.user };

    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: data,
        timeout: 3500,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
        .then((response: AxiosResponse) => {
            if (action.type !== 'FORGOT_PASSWORD') {
                action = { ...action, user: response.data };
            }
            callback(action);
        })
        .catch((error) => {
            return Promise.reject(error);
        });
}