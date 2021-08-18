import pluralize from "pluralize"

export function pluralFormFactory(word: string, length: number): string {
    return pluralize(word, length)
}
