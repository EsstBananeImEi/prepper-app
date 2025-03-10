export type Setter<T> = (data: T) => void
export type MyDate = { hour: number, minute: number, second: number }
export type ComponentVisible = [React.RefObject<HTMLDivElement>, boolean, React.Dispatch<React.SetStateAction<boolean>>]
export type Dimension = { height: number, width: number }
export type NutrientFactoryType = { id: number, color: string, name: string, values: NutrientTypModel[] }
export type NutrientTypModel = { typ: string, value: number }