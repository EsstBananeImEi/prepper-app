
import axios, { AxiosPromise, AxiosResponse } from "axios";
import React, { createContext, Dispatch, ReactElement, useContext, useEffect, useReducer } from "react";
import LoadingSpinner from "../components/loading-spinner/LoadingSpinner";
import { BasketModel, StorageModel } from "../components/storage-components/StorageModel";
import { useInitial, useStorageApi } from "../hooks/StorageApi";
import { basketItemsApi, sortByName } from "../shared/Constants";

export interface Store {
    shoppingCard: BasketModel[]
}



export const initialState: Store = { shoppingCard: [] }

export interface AddToShoppingCard {
    type: 'ADD_TO_CARD'
    storeageItem: StorageModel
}

export interface RemoveFromShoppingCard {
    type: 'REMOVE_FROM_CARD'
    storeageItem: BasketModel
}

export interface ClearCard {
    type: 'CLEAR_CARD'
}
export interface ClearItemCard {
    type: 'CLEAR_ITEM_CARD'
    storeageItem: StorageModel
}
export interface InitialCards {
    type: 'INITIAL_CARDS'
    storeageItem: BasketModel[] | undefined
}


export type Action = AddToShoppingCard | RemoveFromShoppingCard | ClearItemCard | ClearCard | InitialCards
export type DispatchAction = React.Dispatch<Action>

export function reducer(store: Store, action: Action): Store {
    switch (action.type) {
        case 'ADD_TO_CARD':
            return { ...store, shoppingCard: [...store.shoppingCard, action.storeageItem] }

        case 'REMOVE_FROM_CARD': {
            const index = store.shoppingCard.map(storedItem => Number(storedItem.id)).indexOf(Number(action.storeageItem.id))
            return { ...store, shoppingCard: store.shoppingCard.filter((storeageItem, index_) => index !== index_ && storeageItem.id !== action.storeageItem.id) }
        }
        case 'CLEAR_CARD': {
            return { ...store, shoppingCard: [] }
        }
        case 'INITIAL_CARDS': {
            return { ...store, shoppingCard: action.storeageItem ? action.storeageItem : [] }
        }
        case 'CLEAR_ITEM_CARD': {
            return {
                ...store, shoppingCard: store.shoppingCard.filter(storedItem => storedItem.id !== action.storeageItem.id)
            }
        }
        default:
            return store
    }
}

interface StoreContextModel {
    store: Store;
    dispatch: Dispatch<Action>
}

const StoreContext = createContext({} as StoreContextModel)
export const useStore = (): StoreContextModel => useContext(StoreContext)



export function StoreProvider(props: { children: ReactElement, store?: Store }): ReactElement {
    const [storageItems, setStorageItems, axiosResponse] = useStorageApi<BasketModel[]>('get', '/basket?_sort=name')

    const [store, dispatch] = useReducer(reducer, props.store || initialState)
    useEffect(() => {
        dispatch({ type: 'INITIAL_CARDS', storeageItem: storageItems })
    }, [storageItems, dispatch]);
    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    );
}