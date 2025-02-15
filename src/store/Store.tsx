
import React, { createContext, Dispatch, ReactElement, useContext, useEffect, useReducer } from "react";
import { BasketModel, StorageModel } from "../components/storage-components/StorageModel";
import { useStorageApi } from "../hooks/StorageApi";
import { basketItemsApi, sortByName } from "../shared/Constants";

export interface Store {
    shoppingCard: BasketModel[]
}

export const initialState: Store = { shoppingCard: [] }

export interface AddToShoppingCard {
    type: 'ADD_TO_CARD'
    storeageItem: BasketModel
}

export interface DeacreaseAmount {
    type: 'DECREASE_AMOUNT'
    storeageItem: BasketModel
}

interface ClearCard {
    type: 'CLEAR_CARD'
}
export interface ClearItemCard {
    type: 'CLEAR_ITEM_CARD'
    storeageItem: BasketModel
}

export interface InitialCards {
    type: 'INITIAL_CARDS'
    storeageItem: BasketModel[] | undefined
}

export interface IncreaseAmount {
    type: 'INCREASE_AMOUNT'
    storeageItem: BasketModel
}

export type Action = AddToShoppingCard | DeacreaseAmount | ClearItemCard | ClearCard | InitialCards | IncreaseAmount
export type DispatchAction = React.Dispatch<Action>

export function reducer(store: Store, action: Action): Store {
    console.log("Reducer triggered:", action);
    switch (action.type) {
        case 'ADD_TO_CARD':
            return { ...store, shoppingCard: [...store.shoppingCard, action.storeageItem] }

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
        case 'CLEAR_CARD': {
            return { ...store, shoppingCard: [] }
        }
        case 'INITIAL_CARDS': {
            return { ...store, shoppingCard: action.storeageItem ? action.storeageItem : [] }
        }
        case 'CLEAR_ITEM_CARD': {
            return {
                ...store, shoppingCard: store.shoppingCard.filter(item => item.id !== action.storeageItem.id) as BasketModel[]
            }
        }
        case 'INCREASE_AMOUNT': {
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
    const [storageItems, setStorageItems, axiosResponse] = useStorageApi<BasketModel[]>('get', `${basketItemsApi}`)
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