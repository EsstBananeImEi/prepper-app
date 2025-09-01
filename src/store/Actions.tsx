import axios, { AxiosResponse, Method } from 'axios';
import { baseApiUrl, itemsRoute, nutrientsApi } from '../shared/Constants';
import { Action, AddToShoppingCard, IncreaseAmount, DecreaseAmount, ClearItemCard, LoginUser, RegisterUser, EditUser, IncreaseStorageItem, DecreaseStorageItem, AddStorageItem, DeleteStorageItem, UpdateStorageItem, UpdateNutrientItem, UpdateCardItem, ForgotPassword } from './Store';
import { validateBase64Image, debugImageData } from '../utils/imageUtils';
import { apiDebugger } from '../utils/apiDebugger';
import { env } from 'process';
import createSecureApiClient from '../utils/secureApiClient';

export const actionHandler = (action: Action, callback: React.Dispatch<Action>): Promise<void> => {

    // Add stack trace for automatic storage updates to help debug
    // if (action.type === 'INCREASE_STORAGE_ITEM' || action.type === 'DECREASE_STORAGE_ITEM' || action.type === 'UPDATE_STORAGE_ITEM') {
    //     console.group(`🔍 Debugging Storage Action: ${action.type}`);
    //     console.log('Action details:', action);
    //     console.trace('Call stack for this storage action');
    //     console.groupEnd();
    // }

    switch (action.type) {
        case 'ADD_TO_CARD':
            return sendRequest('POST', `/basket`, action, callback);
        case 'UPDATE_CARD_ITEM':
            return sendRequest('PUT', `/basket/${action.basketItems.id}`, action, callback);
        case 'DECREASE_AMOUNT':
        case 'INCREASE_AMOUNT':
            return sendRequest('PUT', `/basket/${action.basketItems.id}`, action, callback);
        case 'CLEAR_ITEM_CARD':
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

    let requestData: Partial<typeof action.basketItems> = { ...action.basketItems };
    if (method === 'POST') {
        const { id, ...dataWithoutId } = requestData;
        requestData = dataWithoutId;
    }

    const api = createSecureApiClient();
    return api({
        method,
        url: `${path}`,
        data: requestData,
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' },
    })
        .then((response: AxiosResponse) => {
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
    const token = userData ? JSON.parse(userData).access_token : null;    // Prepare data for API - ensure proper format
    // lastChanged wird vom Backend verwaltet, nicht mitsenden
    const { lastChanged: _omitLastChanged, ...restWithoutLastChanged } = action.storageItem as typeof action.storageItem;
    let requestData: Partial<typeof action.storageItem> = { ...restWithoutLastChanged };

    // For new items, remove ID from request
    if (method === 'POST') {
        const { id, ...dataWithoutId } = requestData;
        requestData = dataWithoutId;
    }    // Additional validation for icon data before API call
    if (requestData.icon) {
        // Enhanced debugging with detailed image analysis
        debugImageData(requestData.icon, `API Request - ${method} ${path}`);

        // If icon looks like it might be a data URL (common mistake), strip the prefix
        // if (requestData.icon.startsWith('data:image/')) {
        //     console.warn('Icon contains data URL prefix, this might cause API errors');
        //     console.log('Original icon starts with:', requestData.icon.substring(0, 30));
        //     // The sanitizeBase64ForApi should have already handled this, but double-check
        // }

        // Check if it's valid base64
        try {
            if (requestData.icon.length > 0) {
                window.atob(requestData.icon.substring(0, Math.min(requestData.icon.length, 100)));
            }
        } catch (error) {
            console.error('❌ Icon is not valid Base64:', error);
            console.error('This will likely cause API errors');
        }
        console.groupEnd();
    }

    // Log request details for debugging
    // console.group('🌐 Storage API Request');
    // console.log('Method:', method);
    // console.log('URL:', `${baseApiUrl}${path}`);
    // console.log('Data keys:', Object.keys(requestData));
    // console.log('Has Icon:', !!requestData.icon);
    // console.log('Icon length:', requestData.icon?.length || 0); console.log('Has Token:', !!token);
    // console.groupEnd();

    const startTime = Date.now();
    const requestUrl = `${baseApiUrl}${path}`;

    const api = createSecureApiClient();
    return api({
        method,
        url: path,
        data: requestData,
        timeout: 10000, // Increased timeout
        headers: { 'Content-Type': 'application/json' },
    }).then((response: AxiosResponse) => {
        const duration = Date.now() - startTime;

        // Log to API debugger
        apiDebugger.logRequest({
            timestamp: new Date().toISOString(),
            method: method.toUpperCase(),
            url: requestUrl,
            status: response.status,
            duration,
            requestData,
            responseData: response.data
        });

        // console.group('✅ Storage API Response');
        // console.log('Status:', response.status);
        // console.log('Response Data:', response.data);
        // console.groupEnd();

        // Check if the response contains an error message even with 200 status
        if (response.data && typeof response.data === 'string' &&
            (response.data.includes('Ungültige Bilddaten') ||
                response.data.includes('Bildformat konnte nicht verarbeitet werden') ||
                response.data.includes('error') ||
                response.data.includes('Error'))) {

            // console.group('⚠️ API Response contains error message');
            // console.error('Error in successful response:', response.data);
            // console.error('This indicates backend validation failed');
            // console.groupEnd();

            // Log the error to API debugger
            apiDebugger.logRequest({
                timestamp: new Date().toISOString(),
                method: method.toUpperCase(),
                url: requestUrl,
                status: response.status,
                duration,
                error: `Backend validation error: ${response.data}`,
                requestData,
                responseData: response.data
            });

            // Treat this as an error even though status is 200
            return Promise.reject(new Error(`Backend validation error: ${response.data}`));
        }

        if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put') {
            action = { ...action, storageItem: response.data };
        }
        callback(action);
    })
        .catch((error) => {
            const duration = Date.now() - startTime;

            // Log to API debugger
            apiDebugger.logRequest({
                timestamp: new Date().toISOString(),
                method: method.toUpperCase(),
                url: requestUrl,
                status: error.response?.status,
                duration,
                error: error.message || 'Unknown error',
                requestData,
                responseData: error.response?.data
            });

            // console.group('❌ Storage API Error');
            // console.error('Status:', error.response?.status);
            // console.error('Response:', error.response?.data);
            // console.error('Request Data:', requestData);
            // console.groupEnd();
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
    const api = createSecureApiClient();
    return api({
        method,
        url: `${path}`,
        data: { ...action.storageItem.nutrients },
        timeout: 3500,
        headers: {},
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

    const api = createSecureApiClient();
    return api({
        method,
        url: `${path}`,
        data: data,
        timeout: 3500,
        headers: {},
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