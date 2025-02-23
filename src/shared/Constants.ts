const dash = '/';
const search = (text: string): string => `?q=${text}`;
export const sortByName = (sortBy: string): string => `?_sort=${sortBy}`;

// ✅ Neue API-Endpunkte für die Datenbank
export const loginApi = `/login`;
export const registerApi = `/register`;
export const userApi = `/user`;
export const itemsApi = `/items`;
export const basketItemsApi = `/basket`; // Oder den richtigen API-Pfad
export const updateBasketItemApi = (itemId: number | string): string => `${basketItemsApi}/${itemId}`;
export const deleteBasketItemApi = (itemId: number | string): string => `${basketItemsApi}/${itemId}`;
export const nutrientsApi = (itemId: number | string): string => `${itemsApi}/${itemId}/nutrients`;
export const itemIdApi = (id: number | string): string => `${itemsApi}${dash}${String(id)}`;
export const itemSearchApi = (text: string): string => `${itemsApi}${search(text)}`;
export const optionsCategoriesApi = `/categories`;
export const optionsStorageLocationsApi = `/storage-locations`;
export const optionsItemUnitsApi = `/item-units`;
export const optionsNutrientUnitsApi = `/nutrient-units`;
export const optionsPackageUnitsApi = `/package-units`;

// ✅ Anpassung der Frontend-Routen
export const iconRoute = (icon: string): string => `/static/StorageItemsIcons/${icon}`;
export const homeRoute = '/home';
export const itemsRoute = '/items';
export const basketRoute = '/basket';
export const itemIdRoute = (id: number | string): string => `${itemsRoute}/${String(id)}`;
export const newItemRoute = `${itemsRoute}/new`;
export const editItemRoute = (id: number | string): string => `${itemIdRoute(id)}/edit`;
export const errorRoute = (message: string): string => `${itemsRoute}/error/${message}`;

// ✅ Falls Backend auf anderem Port läuft, hier anpassen
export const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';  // Falls dein Backend jetzt auf 5000 läuft
export const baseLocalApiUrl = baseApiUrl;
