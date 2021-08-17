export type Setter<T> = (data: T) => void
export type MyDate = { hour: number, minute: number, second: number }
export type ComponentVisible = [React.RefObject<HTMLDivElement>, boolean, React.Dispatch<React.SetStateAction<boolean>>]