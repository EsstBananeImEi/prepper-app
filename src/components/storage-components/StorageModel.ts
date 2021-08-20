export interface StorageModel {
    id: number,
    name: string,
    amount: number,
    categories?: string[],
    lowestAmount: number,
    midAmount: number,
    unit: string,
    packageQuantity?: number,
    packageUnit?: string,
    nutrients?: NutrientModel,
    icon?: string
}

interface NutrientModel {
    description: string,
    unit: string,
    amount: number,
    values: NutrientValueModel[]
}

export interface NutrientValueModel {
    id: number,
    name: string,
    color: string,
    values: NutrientTypModel
}

export interface NutrientTypModel {
    typ: string,
    value: number,
}