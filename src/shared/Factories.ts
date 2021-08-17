import pluralize from "pluralize"


export function pluralFormFactory(word: string): string {
    return pluralize(word, 2)
}

pluralFormFactory('test')