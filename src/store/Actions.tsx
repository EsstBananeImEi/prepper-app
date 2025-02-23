import axios, { AxiosResponse, Method } from 'axios';
import { baseApiUrl } from '../shared/Constants';
import { Action, AddToShoppingCard, IncreaseAmount, DecreaseAmount, ClearItemCard, LoginUser, RegisterUser, EditUser } from './Store';

export const actionHandler = (action: Action, callback: React.Dispatch<Action>): Promise<void> => {
    console.log("ActionHandler triggered:", action);
    switch (action.type) {
        case 'ADD_TO_CARD':
            return sendRequest('POST', `/basket`, action, callback);
        case 'DECREASE_AMOUNT':
        case 'INCREASE_AMOUNT':
            return sendRequest('PUT', `/basket/${action.storeageItem.id}`, action, callback);
        case 'CLEAR_ITEM_CARD':
            return sendRequest('DELETE', `/basket/${action.storeageItem.id}`, action, callback);
        case 'LOGIN_USER':
            return sendUserRequest('POST', `/login`, action, callback);
        case 'REGISTER_USER':
            return sendUserRequest('POST', `/register`, action, callback);
        case 'EDIT_USER':
            return sendUserRequest('PUT', `/user`, action, callback);
        default:
            return Promise.resolve();
    }
};

function sendRequest(
    method: Method,
    path: string,
    action: AddToShoppingCard | DecreaseAmount | IncreaseAmount | ClearItemCard,
    callback: React.Dispatch<Action>
): Promise<void> {
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: { ...action.storeageItem, id: 0 },
        timeout: 2000,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
        .then((response: AxiosResponse) => {
            if (response.config.method?.toLowerCase() === 'post' || response.config.method?.toLowerCase() === 'put') {
                action = { ...action, storeageItem: response.data };
            }
            callback(action);
        })
        .catch((error) => {
            console.error("Axios request error:", error);
            return Promise.reject(error);
        });
}

function sendUserRequest(
    method: Method,
    path: string,
    action: LoginUser | RegisterUser | EditUser,
    callback: React.Dispatch<Action>
): Promise<void> {
    console.log("User-Request:", action);
    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;
    return axios({
        method,
        url: `${baseApiUrl}${path}`,
        data: { ...action.user },
        timeout: 2000,
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
        .then((response: AxiosResponse) => {
            action = { ...action, user: response.data };
            callback(action);
        })
        .catch((error) => {
            console.error("Axios request error:", error);
            return Promise.reject(error);
        });
}
