const dash = '/';
const search = (text: string): string => `?q=${text}`;
export const sortByName = (sortBy: string): string => `?_sort=${sortBy}`;

// ✅ Neue API-Endpunkte für die Datenbank
export const itemsApi = `/items`;
export const basketItemsApi = `/basket-items`; // Oder den richtigen API-Pfad
export const nutrientsApi = (itemId: number | string): string => `${itemsApi}/${itemId}/nutrients`;
export const itemIdApi = (id: number | string): string => `${itemsApi}${dash}${String(id)}`;
export const itemSearchApi = (text: string): string => `${itemsApi}${search(text)}`;

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
export const baseApiUrl = 'http://localhost:5000';  // Falls dein Backend jetzt auf 5000 läuft
export const baseLocalApiUrl = baseApiUrl;
