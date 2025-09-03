export interface StorageModel {
    id: number,
    name: string,
    amount: number,
    barcode?: string,
    categories?: string[],
    lowestAmount: number,
    midAmount: number,
    unit: string,
    packageQuantity?: number,
    packageUnit?: string,
    storageLocation: string,
    // ISO-8601 Zeitstempel, wird vom Backend verwaltet
    lastChanged?: string,
    nutrients?: NutrientModel,
    icon?: string  // Base64 encoded string or null if no icon
}

export interface NutrientModel {
    description: string,
    unit: string,
    amount: number,
    values: NutrientValueModel[]
}

export interface NutrientValueModel {
    id: number,
    name: string,
    color: string,
    values: NutrientTypModel[]
}

export interface NutrientTypModel {
    typ: string,
    value: number,
}

export interface OptionModel {
    id: number,
    name: string
}


export interface BasketModel {
    id: number
    name: string
    amount: string
    categories: string[]
    icon: string
}