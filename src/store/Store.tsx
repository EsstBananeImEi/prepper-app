import React, { createContext, Dispatch, ReactElement, useContext, useEffect, useReducer } from "react";
import { BasketModel, NutrientModel, StorageModel } from "../components/storage-components/StorageModel";
import { useStorageApi } from "../hooks/StorageApi";
import { basketItemsApi, itemsApi } from "../shared/Constants";
import { UserModel } from "~/shared/Models";
import { validateAndCleanStorageItems } from "../utils/imageUtils";
import logger from '../utils/logger';

// Store Interface
export interface Store {
    shoppingCard: BasketModel[];
    user: UserModel | null;
    storeItems: StorageModel[];
}

// Session-Handling (Ablauf & Inaktivität)
type SessionMeta = {
    lastActiveAt: number; // ms epoch
    expiresAt: number; // ms epoch
};

const SESSION_META_KEY = "sessionMeta";
// Standard-Webapp Richtwerte: Absolut 8 Stunden, Idle 60 Minuten
const SESSION_TTL_MIN = 480; // 8h absolute Sitzungsdauer
const IDLE_TTL_MIN = 60;     // 1h Inaktivitäts-Timeout
const SESSION_TTL_MS = SESSION_TTL_MIN * 60 * 1000;
const IDLE_TTL_MS = IDLE_TTL_MIN * 60 * 1000;

function readSessionMeta(): SessionMeta | null {
    try {
        const raw = localStorage.getItem(SESSION_META_KEY);
        return raw ? JSON.parse(raw) as SessionMeta : null;
    } catch {
        return null;
    }
}

function writeSessionMeta(meta: SessionMeta) {
    localStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
}

function clearSessionMeta() {
    localStorage.removeItem(SESSION_META_KEY);
}

function startNewSessionMeta(now: number = Date.now()): SessionMeta {
    return { lastActiveAt: now, expiresAt: now + SESSION_TTL_MS };
}

function isSessionValid(meta: SessionMeta | null, now: number = Date.now()): boolean {
    if (!meta) return false;
    if (now > meta.expiresAt) return false; // absolute Ablauf
    if (now - meta.lastActiveAt > IDLE_TTL_MS) return false; // Inaktivität
    return true;
}

function updateLastActive(now: number = Date.now()) {
    const meta = readSessionMeta();
    if (!meta) return;
    // Nur lastActiveAt aktualisieren; absolute expiresAt bleibt bestehen
    writeSessionMeta({ ...meta, lastActiveAt: now });
}

function getInitialUser(): UserModel | null {
    try {
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? (JSON.parse(userRaw) as UserModel) : null;
        const meta = readSessionMeta();
        if (!user) return null;
        if (!isSessionValid(meta)) {
            localStorage.removeItem("user");
            clearSessionMeta();
            return null;
        }
        return user;
    } catch {
        return null;
    }
}

// Initialer Zustand
export const initialState: Store = {
    shoppingCard: [],
    user: getInitialUser(), // Benutzer nach Reload wiederherstellen (mit Session-Validierung)
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
            logger.log("Clear Item Card:", action.basketItems);
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
            logger.log("Set Store User:", action.user);
            localStorage.setItem("user", JSON.stringify(action.user));
            writeSessionMeta(startNewSessionMeta());
            return { ...store, user: action.user };

        // Benutzer Logout
        case 'LOGOUT_USER':
            localStorage.removeItem("user");
            localStorage.removeItem("debugPanelEnabled");
            clearSessionMeta();
            return { ...store, user: null };
        case 'FORGOT_PASSWORD':
            localStorage.removeItem("user");
            clearSessionMeta();
            return { ...store, user: null };
        case 'REGISTER_USER':
            // localStorage.setItem("user", JSON.stringify(action.user));
            return { ...store, user: action.user };
        case 'EDIT_USER':
            localStorage.setItem("user", JSON.stringify(action.user));
            return { ...store, user: action.user };

        case 'INITIAL_STORAGE':
            return { ...store, storeItems: action.storageItems ? action.storageItems : [] };
        case 'INCREASE_STORAGE_ITEM':
            return {
                ...store,
                storeItems: store.storeItems?.map(item => item.id === action.storageItem.id ? { ...item, ...action.storageItem } : item)
            };
        case 'DECREASE_STORAGE_ITEM':
            return {
                ...store,
                storeItems: store.storeItems.map(item => {
                    if (item.id === action.storageItem.id) {
                        const next = Math.max(0, action.storageItem.amount);
                        return { ...item, ...action.storageItem, amount: next };
                    }
                    return item;
                }),
            };
        case 'DELETE_STORAGE_ITEM':
            return { ...store, storeItems: store.storeItems.filter(item => item.id !== action.storageItem.id) };
        case 'ADD_STORAGE_ITEM':
            return { ...store, storeItems: [...store.storeItems, action.storageItem] };
        case 'UPDATE_STORAGE_ITEM':
            return { ...store, storeItems: store.storeItems.map(item => item.id === action.storageItem.id ? action.storageItem : item) };
        case 'UPDATE_NUTRIENT_ITEM':
            return {
                ...store, storeItems: store.storeItems.map(item => item.id === action.storageItem.id ? { ...item, nutrients: Array.isArray(action.storageItem.nutrients) ? (action.storageItem.nutrients[0] || null) : action.storageItem.nutrients } : item)
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
                logger.log('Cleaned corrupted basket items');
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
                logger.log('Cleaned corrupted storage items');
                dispatch({ type: 'INITIAL_STORAGE', storageItems: cleanedStorageItems });
            } else {
                dispatch({ type: 'INITIAL_STORAGE', storageItems: storageItems });
            }
        } else {
            dispatch({ type: 'INITIAL_STORAGE', storageItems: storageItems });
        }
    }, [storageItems, dispatch]);

    // Session Inaktivitäts-/Ablauf-Überwachung
    useEffect(() => {
        const activity = () => updateLastActive();
        const events: (keyof DocumentEventMap)[] = ['click', 'keydown', 'mousemove', 'touchstart', 'visibilitychange'];
        events.forEach(evt => document.addEventListener(evt, activity, { passive: true } as AddEventListenerOptions));

        const check = () => {
            const userExists = !!localStorage.getItem('user');
            const valid = isSessionValid(readSessionMeta());
            if (userExists && !valid) {
                dispatch({ type: 'LOGOUT_USER' });
            }
        };
        // Sofort prüfen und anschließend in Intervallen
        check();
        const interval = window.setInterval(check, 60 * 1000); // alle 60s prüfen

        return () => {
            events.forEach(evt => document.removeEventListener(evt, activity as EventListener));
            window.clearInterval(interval);
        };
    }, []);
    return (
        <StoreContext.Provider value={{ store, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    );
}
