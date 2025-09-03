import { NutrientFactoryType } from "../types/Types"

export function pluralFormFactory(word: string, length: number): string {
    const unit = (word || '').trim()
    if (!unit) return ''
    // If count is 1 (or effectively 1.0), return singular as provided
    const n = Number(length)
    if (!isFinite(n) || Math.abs(n - 1) < 1e-9) return unit

    // Minimal German pluralization for common units (fallback to unchanged)
    const map: Record<string, { sing: string; plural: string }> = {
        'Stück': { sing: 'Stück', plural: 'Stück' },
        'Stk': { sing: 'Stk', plural: 'Stk' },
        'Packung': { sing: 'Packung', plural: 'Packungen' },
        'Pck.': { sing: 'Pck.', plural: 'Pck.' },
        'Rolle': { sing: 'Rolle', plural: 'Rollen' },
        'Flasche': { sing: 'Flasche', plural: 'Flaschen' },
        'Dose': { sing: 'Dose', plural: 'Dosen' },
        'Glas': { sing: 'Glas', plural: 'Gläser' },
        'Beutel': { sing: 'Beutel', plural: 'Beutel' },
        'Tüte': { sing: 'Tüte', plural: 'Tüten' },
        'Karton': { sing: 'Karton', plural: 'Kartons' },
        'Kiste': { sing: 'Kiste', plural: 'Kisten' },
        'Sack': { sing: 'Sack', plural: 'Säcke' },
        'Packungen': { sing: 'Packung', plural: 'Packungen' },
        // Common short units should not change
        'g': { sing: 'g', plural: 'g' },
        'kg': { sing: 'kg', plural: 'kg' },
        'mg': { sing: 'mg', plural: 'mg' },
        'l': { sing: 'l', plural: 'l' },
        'ml': { sing: 'ml', plural: 'ml' },
        'cm': { sing: 'cm', plural: 'cm' },
        'm': { sing: 'm', plural: 'm' },
        'St': { sing: 'St', plural: 'St' },
    }
    const entry = map[unit]
    if (entry) return entry.plural
    // Default: leave unchanged (no English s)
    return unit
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
                { typ: 'g', value: 0 },
            ],
        },
        {
            name: "Ballaststoffe", color: '#4D5360', id: 5, values: [
                { typ: 'g', value: 0 },
            ],
        },
        {
            name: "Salz", color: '#B8B8B8', id: 6, values: [
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