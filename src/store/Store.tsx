import React, { createContext, Dispatch, ReactElement, useContext, useEffect, useReducer } from "react";
import { BasketModel } from "../components/storage-components/StorageModel";
import { useStorageApi } from "../hooks/StorageApi";
import { basketItemsApi } from "../shared/Constants";
import { UserModel } from "~/shared/Models";

// Store Interface
export interface Store {
    shoppingCard: BasketModel[];
    user: UserModel | null;
}

// Initialer Zustand
export const initialState: Store = {
    shoppingCard: [],
    user: JSON.parse(localStorage.getItem("user") || "null") // Benutzer nach Reload wiederherstellen
};

// Aktionen für den Reducer
export interface AddToShoppingCard {
    type: 'ADD_TO_CARD';
    storeageItem: BasketModel;
}

export interface DecreaseAmount {
    type: 'DECREASE_AMOUNT';
    storeageItem: BasketModel;
}

export interface ClearCard {
    type: 'CLEAR_CARD';
}

export interface ClearItemCard {
    type: 'CLEAR_ITEM_CARD';
    storeageItem: BasketModel;
}

export interface InitialCards {
    type: 'INITIAL_CARDS';
    storeageItem: BasketModel[] | undefined;
}

export interface IncreaseAmount {
    type: 'INCREASE_AMOUNT';
    storeageItem: BasketModel;
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

export type Action = AddToShoppingCard | DecreaseAmount | ClearItemCard | ClearCard | InitialCards | IncreaseAmount | LoginUser | LogoutUser | RegisterUser | EditUser;

export function reducer(store: Store, action: Action): Store {
    switch (action.type) {
        case 'ADD_TO_CARD':
            return { ...store, shoppingCard: [...store.shoppingCard, action.storeageItem] };

        case 'DECREASE_AMOUNT': {
            return {
                ...store,
                shoppingCard: store.shoppingCard
                    .map(item => {
                        if (item.id === action.storeageItem.id) {
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
            return { ...store, shoppingCard: action.storeageItem ? action.storeageItem : [] };

        case 'CLEAR_ITEM_CARD':
            return {
                ...store, shoppingCard: store.shoppingCard.filter(item => item.id !== action.storeageItem.id) as BasketModel[]
            };

        case 'INCREASE_AMOUNT':
            return {
                ...store,
                shoppingCard: store.shoppingCard
                    .map(item => {
                        if (item.id === action.storeageItem.id) {
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

        case 'REGISTER_USER':
            localStorage.setItem("user", JSON.stringify(action.user));
            return { ...store, user: action.user };
        case 'EDIT_USER':
            console.log("Set Store User:", action.user);
            localStorage.setItem("user", JSON.stringify(action.user));
            return { ...store, user: action.user };
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
    const [storageItems, setStorageItems] = useStorageApi<BasketModel[]>('get', localStorage.getItem("user") ? `${basketItemsApi}` : "");

    useEffect(() => {
        dispatch({ type: 'INITIAL_CARDS', storeageItem: storageItems });

    }, [storageItems, dispatch]);

    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    );
}
