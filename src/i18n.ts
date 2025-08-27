import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Optional: detect browser language; can add later
// import LanguageDetector from 'i18next-browser-languagedetector';

// Basic resources (de as default, en as secondary)
const resources = {
    de: {
        translation: {
            common: {
                home: 'Home',
                storage: 'Vorrat',
                storage_plural: 'Vorräte',
                checklist: 'Checkliste',
                basket: 'Einkaufsliste',
                user: 'Benutzerprofil',
                login: 'Anmeldung',
                filter: 'Filter',
                filter_with_count: 'Filter ({{count}})',
            },
            breadcrumb: {
                newItem: 'Neues Item',
                editItem: 'Item bearbeiten',
                itemDetails: 'Item Details',
                emergency: 'Notfallvorsorge',
            },
            storage: {
                drawerTitle: 'Filter & Sortierung',
                activeCountSuffix: 'aktiv',
                labels: {
                    search: 'Suchen',
                    categories: 'Kategorien',
                    locations: 'Lagerorte',
                    units: 'Einheiten',
                    sort: 'Sortieren',
                    stock: 'Bestand',
                },
                placeholders: {
                    searchName: 'Name suchen',
                    selectCategories: 'Kategorien wählen',
                    selectLocations: 'Lagerorte wählen',
                    selectUnits: 'Einheiten wählen',
                    selectSortField: 'Feld wählen',
                },
                sortField: {
                    name: 'Name',
                    storageLocation: 'Lagerort',
                    amount: 'Menge',
                    lastChanged: 'Zuletzt geändert',
                },
                sortOrder: {
                    asc: 'Aufsteigend',
                    desc: 'Absteigend',
                    toggleAria: 'Sortierreihenfolge wechseln',
                },
                stock: 'Bestand',
                onlyZero: 'Nur Bestand 0',
                status: {
                    low: 'Kritisch',
                    mid: 'Wenig',
                    high: 'Ausreichend',
                },
                chips: {
                    searchPrefix: 'Suche: ',
                    stockZero: 'Bestand 0',
                    sortPrefix: 'Sortierung: ',
                },
                empty: {
                    noItems: 'Keine Artikel vorhanden',
                    createItem: 'Artikel anlegen',
                },
                locations: {
                    freezer: 'Tiefkühler',
                    fridge: 'Kühlschrank',
                    storage: 'Lager',
                },
            },
            shopping: {
                drawerTitle: 'Filter & Sortierung',
                activeCountSuffix: 'aktiv',
                labels: {
                    search: 'Suchen',
                    categories: 'Kategorien',
                    sort: 'Sortieren',
                },
                placeholders: {
                    searchName: 'Name suchen',
                    selectCategories: 'Kategorien wählen',
                    selectSortField: 'Feld wählen',
                },
                sortField: {
                    name: 'Name',
                    category: 'Kategorie',
                },
                sortOrder: {
                    asc: 'Aufsteigend',
                    desc: 'Absteigend',
                    toggleAria: 'Sortierreihenfolge wechseln',
                },
                chips: {
                    searchPrefix: 'Suche: ',
                    sortPrefix: 'Sortierung: ',
                },
                clearFilters: 'Filter zurücksetzen',
                uncategorized: 'Ohne Kategorie',
                empty: {
                    header: 'Der Einkaufswagen ist leer!'
                    , content: 'Scheint als brauchst du derzeit nichts'
                }
            },
        },
    },
    en: {
        translation: {
            common: {
                home: 'Home',
                storage: 'Storage',
                storage_plural: 'Storage',
                checklist: 'Checklist',
                basket: 'Shopping List',
                user: 'User Profile',
                login: 'Login',
                filter: 'Filter',
                filter_with_count: 'Filter ({{count}})',
            },
            breadcrumb: {
                newItem: 'New Item',
                editItem: 'Edit Item',
                itemDetails: 'Item Details',
                emergency: 'Emergency Preparedness',
            },
            storage: {
                drawerTitle: 'Filter & Sorting',
                activeCountSuffix: 'active',
                labels: {
                    search: 'Search',
                    categories: 'Categories',
                    locations: 'Locations',
                    units: 'Units',
                    sort: 'Sort',
                    stock: 'Stock',
                },
                placeholders: {
                    searchName: 'Search name',
                    selectCategories: 'Select categories',
                    selectLocations: 'Select locations',
                    selectUnits: 'Select units',
                    selectSortField: 'Select field',
                },
                sortField: {
                    name: 'Name',
                    storageLocation: 'Storage location',
                    amount: 'Amount',
                    lastChanged: 'Last changed',
                },
                sortOrder: {
                    asc: 'Ascending',
                    desc: 'Descending',
                    toggleAria: 'Toggle sort order',
                },
                stock: 'Stock',
                onlyZero: 'Only stock 0',
                status: {
                    low: 'Critical',
                    mid: 'Low',
                    high: 'Sufficient',
                },
                chips: {
                    searchPrefix: 'Search: ',
                    stockZero: 'Stock 0',
                    sortPrefix: 'Sorting: ',
                },
                empty: {
                    noItems: 'No items available',
                    createItem: 'Create item',
                },
                locations: {
                    freezer: 'Freezer',
                    fridge: 'Fridge',
                    storage: 'Storage',
                },
            },
            shopping: {
                drawerTitle: 'Filter & Sorting',
                activeCountSuffix: 'active',
                labels: {
                    search: 'Search',
                    categories: 'Categories',
                    sort: 'Sort',
                },
                placeholders: {
                    searchName: 'Search name',
                    selectCategories: 'Select categories',
                    selectSortField: 'Select field',
                },
                sortField: {
                    name: 'Name',
                    category: 'Category',
                },
                sortOrder: {
                    asc: 'Ascending',
                    desc: 'Descending',
                    toggleAria: 'Toggle sort order',
                },
                chips: {
                    searchPrefix: 'Search: ',
                    sortPrefix: 'Sorting: ',
                },
                clearFilters: 'Reset filters',
                uncategorized: 'Uncategorized',
                empty: {
                    header: 'Your shopping cart is empty!',
                    content: 'Looks like you don\'t need anything right now'
                }
            },
        },
    },
};

i18n
    // .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: 'de',
        fallbackLng: 'de',
        interpolation: {
            escapeValue: false,
        },
        returnEmptyString: false,
    });

// Expose for quick manual testing in the browser console: i18n.changeLanguage('en')
if (typeof window !== 'undefined') {
    window.i18n = i18n;
}

export default i18n;
