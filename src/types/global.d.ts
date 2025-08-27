import type { i18n as I18nType } from 'i18next';

declare global {
    interface Window {
        i18n: I18nType;
    }
}

export { };
