export interface StorageModel {
    id: number,
    name: string,
    amount: number,
    categories: string[],
    lowestAmount: number,
    midAmount: number,
    unit: string,
    packageQuantity?: number,
    packageUnit?: string,
    nutrients?: NutrientModel,
    icon: string
}

interface NutrientModel {
    description: string,
    unit: string,
    amount: number,
    values: NutrientValueModel[]
}

interface NutrientValueModel {
    name: string,
    values: NutrientTypModel[]
}

interface NutrientTypModel {
    typ: string,
    value: number,
}