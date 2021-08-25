import pluralize from "pluralize"
import { NutrientFactoryType } from "../types/Types"

export function pluralFormFactory(word: string, length: number): string {
    return pluralize(word, length)
}

export function NutrientFactory(): NutrientFactoryType[] {
    const nutrientMappingDict = [
        { name: "Proteine", color: '#FDB45C', id: 1 },
        { name: "Kohlenhydrate", color: '#46BFBD', id: 2 },
        { name: "Fett", color: '#F7464A', id: 3 },
        { name: "Zucker", color: '#E85F5C', id: 4 },
        { name: "Ballaststoffe", color: '#4D5360', id: 5 },
        { name: "gesättigte Fettsäuren", color: '#C1EEFF', id: 6 },
        { name: "Energie", color: '', id: 7 },
    ]

    return nutrientMappingDict

}