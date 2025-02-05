const dash = '/'
const search = (text: string): string => `?q=${text}`
export const sortByName = (sortBy: string): string => `?_sort=${sortBy}`
export const storedItemsApi = `/storeditems`
export const basketItemsApi = '/basket'
export const storedItemsIdApi = (id: number | string): string => `${storedItemsApi}${dash}${String(id)}`
export const storedItemsSearchApi = (text: string): string => `${storedItemsApi}${search(text)}`

export const homeRoute = '/home'
export const storedItemsRoute = ''
export const storedBasketRoute = '/basket'
export const storedItemIdRoute = (id: number | string): string => `${storedItemsRoute}/${String(id)}`
export const storedNewItemRoute = `${storedItemsRoute}/new`
export const storedEditRoute = (id: number | string): string => `${storedItemIdRoute(id)}/edit`
export const storedErrorRoute = (message: string): string => `${storedItemsRoute}/error/${message}`

export const baseApiUrl = 'http://localhost:3004'
export const baseLocalApiUrl = 'http://localhost:3004'