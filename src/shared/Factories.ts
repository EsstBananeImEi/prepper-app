import { NutrientFactoryType } from "../types/Types"
import { values } from "lodash"

export function pluralFormFactory(word: string, length: number): string {
    // German-friendly: do not auto-append English plural 's'; keep unit as provided
    return (word || '').trim()
}

export function NutrientFactory(): NutrientFactoryType[] {
    const nutrientMappingDict = [
        {
            name: "Proteine", color: '#FDB45C', id: 1, values: [
                { typ: 'g', value: 0 },
            ],
        },
        {
            name: "Kohlenhydrate", color: '#46BFBD', id: 2, values: [
                { typ: 'g', value: 0 },
            ],
        },
        {
            name: "Fett", color: '#F7464A', id: 3, values: [
                { typ: 'g', value: 0 },
            ],
        },
        {
            name: "Zucker", color: '#E85F5C', id: 4, values: [
                { typ: 'kcal', value: 0 },
            ],
        },
        {
            name: "Ballaststoffe", color: '#4D5360', id: 5, values: [
                { typ: 'g', value: 0 },
            ],
        },
        {
            name: "gesättigte Fettsäuren", color: '#C1EEFF', id: 6, values: [
                { typ: 'g', value: 0 },
            ],
        },
        {
            name: "Energie", color: '', id: 7, values: [
                { typ: 'kcal', value: 0 },
                { typ: 'kJ', value: 0 },
            ],
        },
    ]

    return nutrientMappingDict

}