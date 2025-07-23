import React, { createContext, Dispatch, ReactElement, useContext, useEffect, useReducer } from "react";
import { BasketModel, NutrientModel, StorageModel } from "../components/storage-components/StorageModel";
import { useStorageApi } from "../hooks/StorageApi";
import { basketItemsApi, itemsApi } from "../shared/Constants";
import { UserModel } from "~/shared/Models";
import { validateAndCleanStorageItems } from "../utils/imageUtils";

// Store Interface
export interface Store {
    shoppingCard: BasketModel[];
    user: UserModel | null;
    storeItems: StorageModel[];
}

// Initialer Zustand
export const initialState: Store = {
    shoppingCard: [],
    user: JSON.parse(localStorage.getItem("user") || "null"), // Benutzer nach Reload wiederherstellen
    storeItems: [],
};

// Aktionen für den Reducer
export interface AddToShoppingCard {
    type: 'ADD_TO_CARD';
    basketItems: BasketModel;
}

export interface DecreaseAmount {
    type: 'DECREASE_AMOUNT';
    basketItems: BasketModel;
}

export interface ClearCard {
    type: 'CLEAR_CARD';
}

export interface ClearItemCard {
    type: 'CLEAR_ITEM_CARD';
    basketItems: BasketModel;
}

export interface InitialCards {
    type: 'INITIAL_CARDS';
    basketItems: BasketModel[] | undefined;
}

export interface IncreaseAmount {
    type: 'INCREASE_AMOUNT';
    basketItems: BasketModel;
}

// Neue Aktionen für User-Handling
export interface LoginUser {
    type: 'LOGIN_USER';
    user: UserModel;
}

export interface LogoutUser {
    type: 'LOGOUT_USER';
}

export interface RegisterUser {
    type: 'REGISTER_USER';
    user: UserModel;
}

export interface EditUser {
    type: 'EDIT_USER';
    user: UserModel;
}
export interface ForgotPassword {
    type: 'FORGOT_PASSWORD';
    email: string;
}
export interface InitialStorage {
    type: 'INITIAL_STORAGE';
    storageItems: StorageModel[] | undefined;
}

export interface IncreaseStorageItem {
    type: 'INCREASE_STORAGE_ITEM';
    storageItem: StorageModel;
}

export interface DecreaseStorageItem {
    type: 'DECREASE_STORAGE_ITEM';
    storageItem: StorageModel;
}

export interface DeleteStorageItem {
    type: 'DELETE_STORAGE_ITEM';
    storageItem: StorageModel;
}

export interface AddStorageItem {
    type: 'ADD_STORAGE_ITEM';
    storageItem: StorageModel;
}

export interface UpdateStorageItem {
    type: 'UPDATE_STORAGE_ITEM';
    storageItem: StorageModel;
}

export interface UpdateNutrientItem {
    type: 'UPDATE_NUTRIENT_ITEM';
    storageItem: StorageModel;
}

export interface UpdateCardItem {
    type: 'UPDATE_CARD_ITEM';
    basketItems: BasketModel;
}


export type Action =
    AddToShoppingCard
    | UpdateCardItem
    | DecreaseAmount
    | ClearItemCard
    | UpdateNutrientItem
    | ClearCard
    | InitialCards
    | IncreaseAmount
    | LoginUser
    | LogoutUser
    | RegisterUser
    | EditUser
    | InitialStorage
    | IncreaseStorageItem
    | DecreaseStorageItem
    | DeleteStorageItem
    | AddStorageItem
    | UpdateStorageItem
    | ForgotPassword;
export function reducer(store: Store, action: Action): Store {
    switch (action.type) {
        case 'ADD_TO_CARD':
            return { ...store, shoppingCard: [...store.shoppingCard, action.basketItems] };
        case 'UPDATE_CARD_ITEM':
            return {
                ...store,
                shoppingCard: store.shoppingCard.map(item => item.id === action.basketItems.id ? action.basketItems : item)
            };
        case 'DECREASE_AMOUNT': {
            return {
                ...store,
                shoppingCard: store.shoppingCard
                    .map(item => {
                        if (item.id === action.basketItems.id) {
                            const currentAmount = parseInt(item.amount, 10);
                            if (currentAmount > 1) {
                                return { ...item, amount: (currentAmount - 1).toString() };
                            } else {
                                return null;
                            }
                        }
                        return item;
                    })
                    .filter(item => item !== null) as BasketModel[],
            };
        }
        case 'CLEAR_CARD':
            return { ...store, shoppingCard: [] };

        case 'INITIAL_CARDS':
            return { ...store, shoppingCard: action.basketItems ? action.basketItems : [] };

        case 'CLEAR_ITEM_CARD':
            console.log("Clear Item Card:", action.basketItems);
            return {
                ...store, shoppingCard: store.shoppingCard.filter(item => item.id !== action.basketItems.id) as BasketModel[]
            };

        case 'INCREASE_AMOUNT':
            return {
                ...store,
                shoppingCard: store.shoppingCard
                    .map(item => {
                        if (item.id === action.basketItems.id) {
                            const currentAmount = parseInt(item.amount, 10);
                            return { ...item, amount: (currentAmount + 1).toString() };
                        }
                        return item;
                    })
            };

        // Benutzer Login
        case 'LOGIN_USER':
            console.log("Set Store User:", action.user);
            localStorage.setItem("user", JSON.stringify(action.user));
            return { ...store, user: action.user };

        // Benutzer Logout
        case 'LOGOUT_USER':
            localStorage.removeItem("user");
            return { ...store, user: null };
        case 'FORGOT_PASSWORD':
            localStorage.removeItem("user");
            return { ...store, user: null };
        // case 'REGISTER_USER':
        //     localStorage.setItem("user", JSON.stringify(action.user));
        //     return { ...store, user: action.user };
        case 'EDIT_USER':
            localStorage.setItem("user", JSON.stringify(action.user));
            return { ...store, user: action.user };

        case 'INITIAL_STORAGE':
            return { ...store, storeItems: action.storageItems ? action.storageItems : [] };
        case 'INCREASE_STORAGE_ITEM':
            return { ...store, storeItems: store.storeItems?.map(item => item.id === action.storageItem.id ? { ...item, amount: action.storageItem.amount } : item) };
        case 'DECREASE_STORAGE_ITEM':
            return {
                ...store,
                storeItems: store.storeItems
                    .map(item => {
                        if (item.id === action.storageItem.id) {
                            if (item.amount > 1) {
                                return { ...item, amount: action.storageItem.amount };
                            } else {
                                return null;
                            }
                        }
                        return item;
                    })
                    .filter(item => item !== null) as StorageModel[],
            };
        case 'DELETE_STORAGE_ITEM':
            return { ...store, storeItems: store.storeItems.filter(item => item.id !== action.storageItem.id) };
        case 'ADD_STORAGE_ITEM':
            return { ...store, storeItems: [...store.storeItems, action.storageItem] };
        case 'UPDATE_STORAGE_ITEM':
            return { ...store, storeItems: store.storeItems.map(item => item.id === action.storageItem.id ? action.storageItem : item) };
        case 'UPDATE_NUTRIENT_ITEM':
            return {
                ...store, storeItems: store.storeItems.map(item => item.id === action.storageItem.id ? { ...item, nutrients: action.storageItem.nutrients } : item)
            };
        default:
            return store;
    }
}

// Store Context Model
interface StoreContextModel {
    store: Store;
    dispatch: Dispatch<Action>;
}

const StoreContext = createContext({} as StoreContextModel);
export const useStore = (): StoreContextModel => useContext(StoreContext);

export function StoreProvider(props: { children: ReactElement, store?: Store }): ReactElement {
    const [store, dispatch] = useReducer(reducer, props.store || initialState);
    const [basketItems, setBasketItems] = useStorageApi<BasketModel[]>('get', localStorage.getItem("user") ? `${basketItemsApi}` : "");
    const [storageItems, setStorageItems] = useStorageApi<StorageModel[]>('get', localStorage.getItem("user") ? `${itemsApi}` : ""); useEffect(() => {
        // Only validate and clean if we actually have items, and avoid infinite loops
        if (basketItems && basketItems.length > 0) {
            const cleanedBasketItems = validateAndCleanStorageItems(basketItems);
            // Only dispatch if the cleaning actually changed something
            if (JSON.stringify(cleanedBasketItems) !== JSON.stringify(basketItems)) {
                console.log('Cleaned corrupted basket items');
                dispatch({ type: 'INITIAL_CARDS', basketItems: cleanedBasketItems });
            } else {
                dispatch({ type: 'INITIAL_CARDS', basketItems: basketItems });
            }
        } else {
            dispatch({ type: 'INITIAL_CARDS', basketItems: basketItems });
        }
    }, [basketItems, dispatch]);

    useEffect(() => {
        // Only validate and clean if we actually have items, and avoid infinite loops
        if (storageItems && storageItems.length > 0) {
            const cleanedStorageItems = validateAndCleanStorageItems(storageItems);
            // Only dispatch if the cleaning actually changed something
            if (JSON.stringify(cleanedStorageItems) !== JSON.stringify(storageItems)) {
                console.log('Cleaned corrupted storage items');
                dispatch({ type: 'INITIAL_STORAGE', storageItems: cleanedStorageItems });
            } else {
                dispatch({ type: 'INITIAL_STORAGE', storageItems: storageItems });
            }
        } else {
            dispatch({ type: 'INITIAL_STORAGE', storageItems: storageItems });
        }
    }, [storageItems, dispatch]);
    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    );
}
