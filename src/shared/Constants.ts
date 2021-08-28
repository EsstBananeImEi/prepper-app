const dash = '/'
const search = (text: string): string => `?search=${text}`
export const storedItemsApi = `${dash}storeditems`
export const storedItemsIdApi = (id: number | string): string => `${storedItemsApi}${dash}${String(id)}`
export const storedItemsSearchApi = (text: string): string => `${storedItemsApi}${search(text)}`

export const homeRoute = '/home'
export const storedItemsRoute = '/storeditems'
export const storedBasketRoute = '/basket'
export const storedItemIdRoute = (id: number | string): string => `${storedItemsRoute}/${String(id)}`
export const storedNewItemRoute = `${storedItemsRoute}/new`
export const storedEditRoute = (id: number | string): string => `${storedItemIdRoute(id)}/edit`
export const storedErrorRoute = (message: string): string => `${storedItemsRoute}/error/${message}`

export const baseApiUrl = 'https://6128be4a0e3482001777b105.mockapi.io'
export const baseLocalApiUrl = 'http://localhost:3004'