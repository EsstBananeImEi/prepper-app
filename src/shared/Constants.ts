// ✅ API Base URL Configuration
export const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
export const baseLocalApiUrl = baseApiUrl;

// ✅ Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => `${baseApiUrl}${endpoint}`;

// ✅ Helper constants for URL building
const dash = '/';
const search = (text: string): string => `?q=${text}`;
export const sortByName = (sortBy: string): string => `?_sort=${sortBy}`;

// ✅ Authentication API Endpoints
export const loginApi = `/login`;
export const registerApi = `/register`;
export const forgotPasswordApi = `/forgot-password`;
export const refreshTokenApi = `/refresh`;
export const validateAdminApi = `${baseApiUrl}/auth/validate-admin`;
export const activateAccountApi = (token: string): string => `/activate-account/${token}`;
export const resetPasswordApi = (token: string): string => `/reset-password/${token}`;

// ✅ User API Endpoints
export const userApi = `/user`;
export const adminApi = `/admin`;

// ✅ Items API Endpoints
export const itemsApi = `/items`;
export const basketItemsApi = `/basket`;
export const updateBasketItemApi = (itemId: number | string): string => `${basketItemsApi}/${itemId}`;
export const deleteBasketItemApi = (itemId: number | string): string => `${basketItemsApi}/${itemId}`;
export const nutrientsApi = (itemId: number | string): string => `${itemsApi}/${itemId}/nutrients`;
export const itemIdApi = (id: number | string): string => `${itemsApi}${dash}${String(id)}`;
export const itemSearchApi = (text: string): string => `${itemsApi}${search(text)}`;

// ✅ Options API Endpoints
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
export const groupGenerateInviteTokenApi = (id: number | string): string => `${groupsApi}/${id}/generate-invite-token`;
export const groupInvitationsApi = (id: number | string): string => `${groupsApi}/${id}/invitations`;
export const groupRevokeInvitationApi = (id: number | string, token: string): string => `${groupsApi}/${id}/invitations/${token}/revoke`;
export const groupJoinApi = (code: string): string => `${groupsApi}/join/${code}`;
export const groupJoinInvitationApi = (token: string): string => `${groupsApi}/join-invitation/${token}`;
export const groupValidateInvitationApi = (token: string): string => `${groupsApi}/validate-invitation/${token}`;
export const groupLeaveApi = (id: number | string): string => `${groupsApi}/${id}/leave`;
export const groupUpdateApi = (id: number | string): string => `${groupsApi}/${id}`;
export const groupDeleteApi = (id: number | string): string => `${groupsApi}/${id}`;
export const groupRemoveUserApi = (id: number | string, userId: number | string): string => `${groupsApi}/${id}/remove/${userId}`;

// ✅ Frontend Route Constants
export const iconRoute = (icon: string): string => `/static/StorageItemsIcons/${icon}`;
export const rootRoute = '/';
export const homeRoute = '/home';
export const itemsRoute = '/items';
export const basketRoute = '/basket';
export const checklistRoute = '/checklist';
export const adminRoute = '/admin';
export const userRoute = '/user';
export const loginRoute = '/login';
export const detailsRouteBase = '/details';
export const itemIdRoute = (id: number | string): string => `${itemsRoute}/${String(id)}`;
export const newItemRoute = `${itemsRoute}/new`;
export const editItemRoute = (id: number | string): string => `${itemIdRoute(id)}/edit`;
export const errorRoute = (message: string): string => `${itemsRoute}/error/${message}`;

