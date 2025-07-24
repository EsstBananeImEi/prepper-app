const dash = '/';
const search = (text: string): string => `?q=${text}`;
export const sortByName = (sortBy: string): string => `?_sort=${sortBy}`;

// ✅ Neue API-Endpunkte für die Datenbank
export const loginApi = `/login`;
export const registerApi = `/register`;
export const userApi = `/user`;
export const adminApi = `/admin`;
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

// ✅ Groups API Endpoints
export const groupsApi = `/groups`;
export const groupIdApi = (id: number | string): string => `${groupsApi}/${id}`;
export const groupMembersApi = (id: number | string): string => `${groupsApi}/${id}/members`;
export const groupInviteApi = (id: number | string): string => `${groupsApi}/${id}/invite`;
export const groupJoinApi = (code: string): string => `${groupsApi}/join/${code}`;
export const groupJoinInvitationApi = (token: string): string => `${groupsApi}/join-invitation/${token}`;
export const groupLeaveApi = (id: number | string): string => `${groupsApi}/${id}/leave`;

// ✅ Anpassung der Frontend-Routen
export const iconRoute = (icon: string): string => `/static/StorageItemsIcons/${icon}`;
export const homeRoute = '/home';
export const itemsRoute = '/items';
export const basketRoute = '/basket';
export const checklistRoute = '/checklist';
export const adminRoute = '/admin';
export const itemIdRoute = (id: number | string): string => `${itemsRoute}/${String(id)}`;
export const newItemRoute = `${itemsRoute}/new`;
export const editItemRoute = (id: number | string): string => `${itemIdRoute(id)}/edit`;
export const errorRoute = (message: string): string => `${itemsRoute}/error/${message}`;

// ✅ Falls Backend auf anderem Port läuft, hier anpassen
export const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';  // Falls dein Backend jetzt auf 5000 läuft
export const baseLocalApiUrl = baseApiUrl;
