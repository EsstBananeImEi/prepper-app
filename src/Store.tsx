
import React, { createContext, Dispatch, ReactChildren, ReactElement, useContext, useReducer } from "react";
import { StorageModel } from "./components/storage-components/StorageModel";

export interface Store {
    shoppingCard: StorageModel[]
}

export const initialState: Store = { shoppingCard: [] }


interface AddToShoppingCard {
    type: 'ADD_TO_CARD'
    storeageItem: StorageModel
}

interface RemoveFromShoppingCard {
    type: 'REMOVE_FROM_CARD'
    storeageItem: StorageModel
}

interface ClearCard {
    type: 'CLEAR_CARD'
}
interface ClearItemCard {
    type: 'CLEAR_ITEM_CARD'
    storeageItem: StorageModel
}

export type Action = AddToShoppingCard | RemoveFromShoppingCard | ClearItemCard | ClearCard
export type DispatchAction = React.Dispatch<Action>

export function reducer(store: Store, action: Action): Store {
    switch (action.type) {
        case 'ADD_TO_CARD':
            console.log(action.storeageItem)
            return { ...store, shoppingCard: [...store.shoppingCard, action.storeageItem] }

        case 'REMOVE_FROM_CARD': {
            const index = store.shoppingCard.map(storedItem => storedItem.id).indexOf(action.storeageItem.id)
            return { ...store, shoppingCard: store.shoppingCard.filter((storeageItem_, index_) => index !== index_) }
        }
        case 'CLEAR_CARD': {
            return { ...store, shoppingCard: [] }
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
    const [store, dispatch] = useReducer(reducer, props.store || initialState)
    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    );
}