import { UnitPreferences } from '../hooks/useUnitPreferences';

export type QuantityUnit = 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'lb' | 'fl-oz' | 'gal' | 'Stück' | 'Stk';

type FormatOptions = UnitPreferences;

const round = (n: number, digits = 2) => {
    const p = Math.pow(10, digits);
    return Math.round(n * p) / p;
};

// Basic conversions (approx for food context)
const gToLb = (g: number) => g / 453.59237;
const gToOz = (g: number) => g / 28.349523125;
const kgToLb = (kg: number) => gToLb(kg * 1000);
const mlToFlOz = (ml: number) => ml / 29.5735295625;
const lToGal = (l: number) => l * 0.2641720524;

export function formatQuantity(amount: number, unitRaw: string | undefined | null, opts: FormatOptions): { value: number; unit: string; text: string } {
    const unit = (unitRaw || '').trim();
    if (!unit) {
        return { value: amount, unit: '', text: String(amount) };
    }

    const { unitSystem, useShortUnits } = opts;
    let value = amount;
    let outUnit = unit;

    const short = (u: string) => {
        const map: Record<string, string> = {
            Gramm: 'g', Kilogramm: 'kg', Milliliter: 'ml', Liter: 'l',
            Stück: 'Stk', Packung: 'Packg', Päckchen: 'Pck.', Dose: 'Dose', Glas: 'Glas', Flasche: 'Fl.', Beutel: 'Beutel', Kartons: 'Ktn', Rolle: 'Rolle', Tüte: 'Tüte', Kiste: 'Kiste', Sack: 'Sack', Karton: 'Karton'
        };
        // keep common short units as is
        return map[u] || u;
    };

    // Convert metric to imperial where it makes sense
    if (unitSystem === 'imperial') {
        switch (unit) {
            case 'g': value = round(gToOz(amount)); outUnit = useShortUnits ? 'oz' : 'Ounces'; break;
            case 'kg': value = round(kgToLb(amount)); outUnit = useShortUnits ? 'lb' : 'Pounds'; break;
            case 'ml': value = round(mlToFlOz(amount)); outUnit = useShortUnits ? 'fl oz' : 'Fluid Ounces'; break;
            case 'l': value = round(lToGal(amount)); outUnit = useShortUnits ? 'gal' : 'Gallons'; break;
            case 'Gramm': value = round(gToOz(amount)); outUnit = useShortUnits ? 'oz' : 'Ounces'; break;
            case 'Kilogramm': value = round(kgToLb(amount)); outUnit = useShortUnits ? 'lb' : 'Pounds'; break;
            case 'Milliliter': value = round(mlToFlOz(amount)); outUnit = useShortUnits ? 'fl oz' : 'Fluid Ounces'; break;
            case 'Liter': value = round(lToGal(amount)); outUnit = useShortUnits ? 'gal' : 'Gallons'; break;
            case 'Stück': value = round(amount); outUnit = useShortUnits ? 'pcs' : 'Pieces'; break;
            default:
                outUnit = useShortUnits ? short(unit) : unit;
        }
    } else {
        // metric: ensure short vs long german labels
        switch (unit) {
            case 'Gramm': outUnit = useShortUnits ? 'g' : 'Gramm'; break;
            case 'Kilogramm': outUnit = useShortUnits ? 'kg' : 'Kilogramm'; break;
            case 'Milliliter': outUnit = useShortUnits ? 'ml' : 'Milliliter'; break;
            case 'Liter': outUnit = useShortUnits ? 'l' : 'Liter'; break;
            default:
                // already short units or other nouns like Packung
                outUnit = useShortUnits ? short(unit) : unit;
        }
    }

    const text = outUnit ? `${value} ${outUnit}` : String(value);
    return { value, unit: outUnit, text };
}
