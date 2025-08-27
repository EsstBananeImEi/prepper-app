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
            admin: {
                validating: 'Berechtigung wird überprüft...',
                title: 'Administrator-Panel',
                subtitle: 'Erweiterte Einstellungen und Debugging-Tools',
                info: 'Info',
                backToHome: 'Zur Startseite',
                accessDenied: {
                    title: 'Zugriff verweigert',
                    body: 'Sie haben keine Administrator-Berechtigung für diesen Bereich.',
                    securityDetailsTitle: 'Sicherheitsdetails:',
                    serverValidated: 'Admin-Status wird server-seitig validiert',
                    noClientBypass: 'Client-seitige Manipulation ist nicht möglich',
                    unknownError: 'Unbekannter Validierungsfehler'
                },
                userInfo: {
                    title: 'Administrator-Status',
                    currentUser: 'Aktueller Benutzer:',
                    email: 'E-Mail:',
                    userId: 'Benutzer-ID:',
                    adminStatus: 'Admin-Status:',
                    adminYes: '✓ Administrator',
                    unknown: 'Unbekannt',
                    notAvailable: 'Nicht verfügbar'
                },
                system: {
                    title: 'System-Information',
                    devMode: 'Entwicklungsmodus:',
                    devActive: 'Aktiv',
                    devInactive: 'Inaktiv',
                    reactVersion: 'React Version:',
                    browser: 'Browser:',
                    resolution: 'Bildschirmauflösung:'
                },
                tools: {
                    title: 'Administrator-Tools',
                    devToolsTitle: 'Entwickler-Tools',
                    devToolsDesc: 'Nutzen Sie die Browser-Konsole für erweiterte Admin-Funktionen: adminUtils.checkCurrentUserStatus(), adminUtils.enableDebugPanel(), etc.',
                    enableDebugPanel: 'Debug Panel aktivieren',
                    disableDebugPanel: 'Debug Panel deaktivieren',
                    devTestingPanel: 'Developer Testing Panel',
                    clearLocalStorage: 'LocalStorage zurücksetzen'
                },
                modal: {
                    title: 'Administrator-Panel Information',
                    ok: 'Verstanden',
                    welcome: 'Willkommen im Administrator-Panel!',
                    intro: 'Dieses Panel bietet Ihnen erweiterte Funktionen zur Verwaltung und Überwachung der Anwendung:',
                    bullets: {
                        debug: 'Debug Panel: Überwachen Sie API-Requests und Fehler in Echtzeit',
                        system: 'System-Info: Einsicht in wichtige Systemdaten',
                        devtools: 'Developer Tools: Zugriff auf erweiterte Debugging-Funktionen',
                        settings: 'Settings Management: Kontrolle über Debug-Funktionen'
                    },
                    noteTitle: 'Hinweis',
                    noteDesc: 'Administrator-Funktionen sind nur für autorisierte Benutzer verfügbar und sollten mit Vorsicht verwendet werden.'
                },
                cache: {
                    title: 'Bild-Cache Verwaltung',
                    refresh: 'Aktualisieren',
                    loading: 'Lade Cache-Informationen...',
                    usage: 'Cache-Auslastung',
                    usedOf: '{{size}} von {{max}} verwendet',
                    maxMB: '10 MB',
                    labels: {
                        imagesStored: 'Gespeicherte Bilder',
                        cacheSize: 'Cache-Größe',
                        oldestImage: 'Ältestes Bild'
                    },
                    buttons: {
                        cleanExpired: 'Abgelaufene entfernen',
                        clearAll: 'Cache leeren'
                    },
                    confirm: {
                        clearTitle: 'Sind Sie sicher, dass Sie den gesamten Cache löschen möchten?',
                        ok: 'Ja, löschen',
                        cancel: 'Abbrechen'
                    },
                    info: {
                        title: 'Cache-Informationen',
                        line1: '• Gruppenbilder werden automatisch komprimiert und lokal gespeichert',
                        line2: '• Cache wird automatisch nach 7 Tagen bereinigt',
                        line3: '• Maximum 10 MB Cache-Größe',
                        line4: '• Reduziert Netzwerk-Traffic und verbessert Ladezeiten'
                    },
                    toasts: {
                        cleanedExpired: 'Abgelaufene Bilder wurden entfernt',
                        cleanError: 'Fehler beim Bereinigen des Caches',
                        clearedAll: 'Cache wurde vollständig geleert',
                        clearError: 'Fehler beim Leeren des Caches'
                    }
                }
                ,
                settings: {
                    title: 'Admin-Einstellungen',
                    adminAreaTitle: 'Administrator-Bereich',
                    adminAreaDesc: 'Diese Einstellungen sind nur für Administratoren sichtbar.',
                    apiDebugPanel: 'API Debug Panel',
                    apiDebugPanelDesc: 'Zeigt einen draggbaren Debug-Button für API-Überwachung an',
                    switchOn: 'AN',
                    switchOff: 'AUS',
                    debugFunctionsTitle: 'Debug-Funktionen:',
                    features: {
                        monitoring: 'API-Request-Monitoring',
                        errorTracking: 'Error-Tracking und Analyse',
                        performance: 'Performance-Metriken',
                        draggable: 'Draggbarer Button (über unterer Navigation auf Mobile)',
                        exportable: 'Exportierbare Logs'
                    },
                    panelActiveTitle: 'Debug Panel aktiv',
                    panelActiveDesc: 'Der draggbare Debug-Button ist jetzt verfügbar. Klicken Sie darauf, um das Debug Panel zu öffnen.'
                }
                ,
                devPanel: {
                    accessDeniedTitle: 'Zugriff verweigert - Developer Testing Panel',
                    testingToolsOnly: 'Testing-Tools sind nur für autorisierte Entwickler',
                    title: 'Developer Testing Panel',
                    subtitle: 'Umfassende Test-Tools für Entwickler und System-Administratoren zur Überprüfung der Fehlerbehandlung, Logging-Systeme und Anwendungsstabilität.',
                    info: {
                        title: '🔬 Entwickler-Testbereich',
                        desc: 'Diese Tools sind speziell für das Testen und Validieren der Anwendungsstabilität entwickelt.',
                        bullets: {
                            errorBoundary: 'ErrorBoundary Testing: Testen Sie React Error Boundaries und Fehlerprotokollierung',
                            errorLogging: 'Error Logging: Überprüfen Sie localStorage und Server-Logging-Funktionen',
                            emailNotifications: 'Email Notifications: Validieren Sie kritische Fehler-Benachrichtigungen',
                            recovery: 'Recovery Testing: Testen Sie Anwendungs-Recovery-Mechanismen'
                        }
                    },
                    env: {
                        title: 'Umgebungs-Information',
                        fields: {
                            mode: 'Modus:',
                            apiUrl: 'API URL:',
                            errorNotifications: 'Error Notifications:',
                            user: 'Benutzer:'
                        },
                        values: {
                            enabled: 'Aktiviert',
                            criticalOnly: 'Nur bei kritischen Fehlern'
                        }
                    },
                    testing: {
                        title: 'ErrorBoundary & Fehler-Testing',
                        warningTitle: '⚠️ Vorsicht beim Testen',
                        warningDesc: 'Diese Tests lösen echte Fehler aus. In Development wird das React Error Overlay angezeigt - klicken Sie das \'X\' weg, um die ErrorBoundary-UI zu sehen. In Production sehen Benutzer nur die freundliche Fehlerseite.'
                    },
                    logs: {
                        title: '🔍 Error Logs Inspector',
                        instructions: 'Führen Sie diese Befehle in der Browser-Konsole aus:'
                    }
                    ,
                    errorTester: {
                        cardTitle: '🧪 ErrorBoundary Tester',
                        infoAlertTitle: 'ℹ️ Test-Kategorien',
                        infoAlertDesc1: '🟢 Wird von ErrorBoundary abgefangen: Render-Cycle Fehler',
                        infoAlertDesc2: '🔴 Wird NICHT abgefangen: Async-Fehler, Event-Handler, Network-Requests',
                        infoAlertDesc3: '📝 Alle Tests werden geloggt: Prüfen Sie die Browser-Konsole',
                        sections: {
                            caught: '🟢 Wird von ErrorBoundary abgefangen:',
                            uncaught: '🔴 Wird NICHT von ErrorBoundary abgefangen:',
                            proper: '✅ KORREKTE Fehlerbehandlung - Lösungsansätze:'
                        },
                        buttons: {
                            throwError: '🚨 Standard React Error',
                            typeError: '💥 TypeError auslösen',
                            referenceError: '🔍 ReferenceError auslösen',
                            networkErrorSim: '🌐 Network Error simulieren',
                            realNetworkError: '🌐 Echter Network Error',
                            asyncError: '⏰ Async Error',
                            eventHandlerError: '🖱️ Event Handler Error',
                            properNetwork: '✅ Network Error richtig behandeln',
                            properAsync: '✅ Async Error richtig behandeln'
                        },
                        messages: {
                            networkLoading: 'Network Request läuft...',
                            networkSuccess: 'Network Request erfolgreich!',
                            networkUserError: 'Netzwerk-Fehler: Bitte prüfen Sie Ihre Internetverbindung.',
                            asyncLoading: 'Async Operation läuft...',
                            asyncSuccess: 'Async Operation erfolgreich!',
                            asyncFailedTitle: 'Async Operation fehlgeschlagen',
                            asyncFailedDesc: 'Ein zeitversetzter Vorgang ist fehlgeschlagen. Der Fehler wurde geloggt.',
                            asyncFailedMsg: 'Async Operation fehlgeschlagen',
                            userActionFailedTitle: 'Benutzer-Aktion fehlgeschlagen',
                            userActionFailedDesc: 'Beim Verarbeiten Ihrer Aktion ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
                            clearLogsSuccess: 'Alle Error-Logs wurden gelöscht'
                        },
                        logsInspector: {
                            title: '🔍 Error Logs Inspector (Erweitert)',
                            alertTitle: '📊 Drei verschiedene Log-Kategorien',
                            manual: '🔴 manual_error_logs: Nicht-abgefangene Fehler (problematisch)',
                            proper: '🟢 properly_handled_errors: Korrekt behandelte Fehler',
                            boundary: '🔵 error_logs: ErrorBoundary-Logs (automatisch)',
                            consoleTitle: 'Console-Befehle für alle Log-Typen:',
                            comment: {
                                problematic: '// 🔴 Problematische Fehler (nicht behandelt):',
                                proper: '// ✅ Korrekt behandelte Fehler:',
                                boundary: '// 🔵 ErrorBoundary-Logs:',
                                clear: '// 🗑️ Alle Logs löschen:'
                            },
                            clearButton: '🗑️ Alle Error-Logs löschen'
                        }
                    }
                }
            },
            notifications: {
                apiErrorTitle: 'API Fehler',
                apiLoadedTitle: 'Erfolg',
                apiLoadedDesc: 'Daten wurden erfolgreich geladen.',
                saveSuccessTitle: 'Erfolgreich gespeichert',
                saveSuccessDesc: 'Die Änderungen wurden erfolgreich gespeichert.'
            },
            breadcrumb: {
                newItem: 'Neues Item',
                editItem: 'Item bearbeiten',
                itemDetails: 'Item Details',
                emergency: 'Notfallvorsorge',
            },
            navbar: {
                adminPanel: 'Admin-Panel',
                newItem: 'Neu anlegen',
                new: 'Neu',
                logout: 'Abmelden',
            },
            errorPage: {
                title: 'Es ist ein Fehler aufgetreten. Bitte später erneut versuchen.',
                toHome: 'Zur Startseite'
            },
            auth: {
                resetSuccess: {
                    title: 'Passwort zurückgesetzt',
                    defaultMessage: 'Passwort erfolgreich zurückgesetzt.',
                    toLogin: 'Zum Login'
                },
                protected: {
                    accessDeniedTitle: 'Zugriff verweigert',
                    accessDeniedBody1: 'Sie haben keine Administrator-Berechtigung für diesen Bereich.',
                    securityNote: 'Sicherheitshinweis: Admin-Berechtigungen werden server-seitig validiert und können nicht durch Client-Manipulation umgangen werden.',
                    notLoggedIn: 'Nicht angemeldet',
                    adminRequired: 'Admin-Berechtigung erforderlich',
                    unauthorized: 'Nicht autorisiert',
                    sessionExpired: 'Sitzung abgelaufen',
                    serverValidationFailed: 'Server-Validierung fehlgeschlagen'
                },
                securityWarning: {
                    title: '⚠️ Sicherheitshinweis für Entwickler',
                    adminValidated: 'Admin-Berechtigung wird jetzt server-seitig validiert!',
                    note1: 'Das manuelle Setzen von user.isAdmin = true in localStorage funktioniert nicht mehr. Alle Admin-Bereiche werden durch JWT-Token und Backend-Validierung geschützt.',
                    note2: 'Für Development-Zwecke: Verwenden Sie die Backend-API um Admin-Status zu setzen.'
                }
            },
            user: {
                title: 'Benutzerprofil & Gruppenverwaltung',
                tabs: {
                    profile: 'Profil',
                    groups: 'Gruppen'
                },
                form: {
                    labels: {
                        username: 'Benutzername',
                        email: 'E-Mail-Adresse',
                        passwordNew: 'Neues Passwort (optional)',
                        persons: 'Personen im Haushalt',
                        profileImage: 'Profilbild'
                    },
                    validation: {
                        usernameRequired: 'Bitte Benutzername eingeben',
                        usernameMin: 'Der Benutzername muss mindestens 3 Zeichen lang sein.',
                        usernameTrim: 'Benutzername darf keine Leerzeichen am Anfang/Ende haben.',
                        emailRequired: 'Bitte E-Mail eingeben',
                        emailInvalid: 'Ungültige E-Mail',
                        passwordMin: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
                        personsNumber: 'Bitte eine Zahl eingeben'
                    },
                    placeholders: {
                        passwordOptional: 'Neues Passwort (falls ändern)'
                    },
                    upload: {
                        onlyImages: 'Nur Bilddateien erlaubt.',
                        uploadSuccess: 'Bild erfolgreich hochgeladen',
                        uploadError: 'Fehler beim Laden des Bildes.',
                        selectImage: 'Bild hochladen'
                    },
                    buttons: {
                        updateProfile: 'Profil aktualisieren'
                    }
                }
            },
            groups: {
                header: 'Gruppenverwaltung',
                buttons: {
                    create: 'Gruppe erstellen',
                    join: 'Gruppe beitreten',
                    edit: 'Bearbeiten',
                    delete: 'Löschen',
                    leave: 'Verlassen',
                    members: 'Mitglieder',
                    remove: 'Entfernen',
                    close: 'Schließen'
                },
                empty: {
                    title: 'Keine Gruppen gefunden',
                    subtitle: 'Erstellen Sie eine neue Gruppe oder treten Sie einer bestehenden bei.'
                },
                labels: {
                    inviteCode: 'Einladungscode',
                    groupName: 'Gruppenname',
                    descriptionOptional: 'Beschreibung (optional)',
                    groupImageOptional: 'Gruppenbild (optional)',
                    creator: 'Ersteller',
                    role: {
                        admin: 'Administrator',
                        member: 'Mitglied'
                    }
                },
                placeholders: {
                    groupName: 'z.B. Familie Schmidt',
                    groupDescription: 'Beschreibung der Gruppe...'
                },
                confirms: {
                    deleteTitle: 'Sind Sie sicher, dass Sie diese Gruppe löschen möchten?',
                    leaveTitle: 'Sind Sie sicher, dass Sie diese Gruppe verlassen möchten?',
                    removeUserTitle: 'Sind Sie sicher, dass Sie {{username}} aus der Gruppe entfernen möchten?',
                    ok: 'Ja',
                    cancel: 'Nein'
                },
                toasts: {
                    created: 'Gruppe erfolgreich erstellt',
                    updated: 'Gruppe erfolgreich aktualisiert',
                    deleted: 'Gruppe erfolgreich gelöscht',
                    left: 'Gruppe erfolgreich verlassen',
                    removedUser: 'Benutzer erfolgreich aus der Gruppe entfernt',
                    joinSuccess: 'Erfolgreich der Gruppe "{{name}}" beigetreten',
                    loadMembersError: 'Fehler beim Laden der Gruppenmitglieder',
                    inviteCopied: 'Einladungscode kopiert',
                    imageSelectError: 'Bitte wählen Sie eine Bilddatei aus',
                    imageTooLarge: 'Das Bild darf nicht größer als 5MB sein',
                    imageCompressed: 'Bild komprimiert ({{ratio}}% kleiner)',
                    imageCompressionError: 'Fehler bei der Bildkomprimierung'
                },
                ui: {
                    compressing: 'Komprimiere...',
                    selectImage: 'Bild auswählen',
                    changeImage: 'Bild ändern',
                    chooseAnotherImage: 'Anderes Bild wählen',
                    removeCurrentImage: 'Aktuelles Bild entfernen',
                    removeNewSelection: 'Neue Auswahl entfernen',
                    supportedFormats: 'Unterstützte Formate: JPG, PNG, GIF (max. 5MB)',
                    imagesOptimized: 'Bilder werden automatisch optimiert',
                    imageBeingCompressed: 'Bild wird komprimiert...'
                },
                modals: {
                    createTitle: 'Neue Gruppe erstellen',
                    editTitle: 'Gruppe bearbeiten',
                    joinTitle: 'Gruppe beitreten',
                    membersTitle: 'Mitglieder von "{{name}}"',
                    cancel: 'Abbrechen',
                    create: 'Erstellen',
                    save: 'Speichern',
                    join: 'Beitreten'
                }
            },
            invites: {
                processingOne: 'Trete Gruppe "{{name}}" bei...',
                processingMany: 'Trete {{count}} Gruppen bei...',
                successOne: '✅ Erfolgreich der Gruppe "{{name}}" beigetreten!',
                successMany: '✅ Erfolgreich {{count}} Gruppen beigetreten!',
                timeout: 'Gruppenbeitritt dauert zu lange. Bitte versuche es später erneut.',
                error: 'Fehler beim Beitritt zu einer Gruppe. Bitte versuche es erneut.'
            },
            detail: {
                noIdError: 'Keine ID gefunden',
                loadingItems: 'Vorräte werden geladen ...',
                imageLoading: 'Bild wird geladen...',
                sections: {
                    basics: 'Basis',
                    details: 'Details',
                    packaging: 'Verpackung',
                    nutrients: 'Nährwerte',
                },
                labels: {
                    id: 'ID',
                    amount: 'Menge',
                    unit: 'Mengeneinheit',
                    categories: 'Kategorien',
                    lowThreshold: 'Warnschwelle (minimal)',
                    midThreshold: 'Warnschwelle (mittel)',
                    storageLocation: 'Lagerort',
                    packageQty: 'Packungsmenge',
                    packageUnit: 'Packungseinheit',
                },
                nutrientsHeader: 'Nährwertangaben pro {{amount}} {{unit}}',
                table: {
                    value: 'Wert',
                    unit: 'Einheit',
                },
                buttons: {
                    back: 'Zur Übersicht',
                    edit: 'Bearbeiten',
                    delete: 'Löschen',
                },
            },
            form: {
                notifications: {
                    imageProcessing: 'Bild wird verarbeitet...',
                    invalidImageData: 'Ungültige Bilddaten',
                    imageCompressedInfo: 'Bild wurde komprimiert für bessere Performance',
                    imageLoadedSuccess: 'Bild erfolgreich geladen',
                    imageProcessError: 'Fehler beim Verarbeiten des Bildes',
                    createdSuccess: 'Item erfolgreich erstellt',
                    updatedSuccess: 'Item erfolgreich aktualisiert'
                },
                steps: {
                    base: 'Basis',
                    details: 'Details',
                    packaging: 'Verpackung',
                    image: 'Bild',
                    nutrients: 'Nährwerte',
                },
                common: {
                    popular: 'Beliebt',
                },
                labels: {
                    name: 'Name',
                    amount: 'Menge',
                    unitOptional: 'Mengeneinheit (optional)',
                    categories: 'Kategorien',
                    storageLocation: 'Aufbewahrungsort',
                    lowThreshold: 'Warnschwelle (niedrig)',
                    midThreshold: 'Warnschwelle (mittel)',
                    packageSize: 'Packungsgröße',
                    packageUnit: 'Packungseinheit',
                    imagePreview: 'Bildvorschau',
                    uploadImage: 'Bild hochladen',
                    removeImage: 'Bild entfernen',
                },
                placeholders: {
                    name: 'Name',
                    amount: 'Menge (Zahl)',
                    unit: 'z. B. Stück, kg, l – oder eigenen Wert eingeben',
                    categories: 'Kategorie eingeben oder auswählen',
                    storageLocation: 'Aufbewahrungsort eingeben oder auswählen',
                    lowThreshold: 'z. B. 2 – warnt bei Bestand ≤ 2',
                    midThreshold: 'z. B. 5 – zusätzliche Warnstufe',
                    packageSize: 'z. B. 6',
                    packageUnit: 'z. B. Stück, Packung – oder eigenen Wert eingeben',
                    nutrientAmount: 'z. B. 100',
                    nutrientUnit: 'Einheit',
                    colorCode: 'Farbcode',
                    nutrientName: 'Nährstoff',
                    nutrientValue: 'Wert (Zahl)',
                },
                nutrientsHeader: 'Nährwertangaben pro {{amount}} {{unit}}',
                buttons: {
                    toOverview: 'Zur Übersicht',
                    back: 'Zurück',
                    next: 'Weiter',
                    save: 'Speichern',
                    cancel: 'Abbrechen',
                    removeNutrient: 'Gesamten Nährstoff entfernen',
                    addNutrient: 'Nährstoff hinzufügen',
                },
            },
            storage: {
                drawerTitle: 'Filter & Sortierung',
                activeCountSuffix: 'aktiv',
                clearFilters: 'Filter zurücksetzen',
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
            utils: {
                image: {
                    emptyData: 'Leere Bilddaten',
                    invalidBase64Format: 'Ungültiges Base64-Format',
                    invalidMimeType: 'Ungültiger MIME-Type',
                    unsupportedFormat: 'Nicht unterstütztes Bildformat: {{format}}. Unterstützt: {{supported}}',
                    invalidBase64: 'Ungültige Base64-Kodierung',
                    imageTooLarge: 'Bild ist zu groß ({{size}}MB, max. 5MB)',
                    canvasContextUnavailable: 'Canvas context nicht verfügbar',
                    loadError: 'Fehler beim Laden des Bildes',
                    fileTypeOnlyImages: 'Nur Bilddateien sind erlaubt',
                    fileTooLarge: 'Datei ist zu groß (max. 5MB)',
                    fileReadError: 'Fehler beim Lesen der Datei',
                    repairFailed: 'Reparatur der Base64-Daten fehlgeschlagen',
                    repairError: 'Fehler bei der Reparatur: {{error}}',
                    processingError: 'Fehler bei der Bildverarbeitung: {{error}}'
                },
                api: {
                    category: {
                        network: 'Netzwerkfehler',
                        imageData: 'Bilddaten-Fehler',
                        badRequest: 'Ungültige Anfrage',
                        auth: 'Authentifizierung',
                        permission: 'Berechtigung',
                        notFound: 'Nicht gefunden',
                        validation: 'Validierungsfehler',
                        server: 'Server-Fehler',
                        unknown: 'Unbekannter Fehler'
                    },
                    suggestion: {
                        network: 'Überprüfen Sie Ihre Internetverbindung und ob der Server erreichbar ist.',
                        imageData: 'Das Bildformat ist ungültig oder die Datei ist zu groß. Verwenden Sie JPG/PNG unter 5MB.',
                        badRequest: 'Überprüfen Sie die gesendeten Daten auf Vollständigkeit und korrekte Formate.',
                        auth: 'Sie sind nicht angemeldet oder Ihre Sitzung ist abgelaufen. Bitte loggen Sie sich erneut ein.',
                        permission: 'Sie haben keine Berechtigung für diese Aktion.',
                        notFound: 'Das angeforderte Element existiert nicht oder wurde gelöscht.',
                        validation: 'Die Daten entsprechen nicht den Anforderungen. Überprüfen Sie alle Pflichtfelder.',
                        server: 'Ein interner Serverfehler ist aufgetreten. Versuchen Sie es später erneut.',
                        unknown: 'Ein unerwarteter Fehler ist aufgetreten. Kontaktieren Sie den Support falls das Problem weiterhin besteht.'
                    },
                    debug: {
                        serverResponse: 'Server Response:'
                    }
                }
            }
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
            admin: {
                validating: 'Validating permission...',
                title: 'Admin Panel',
                subtitle: 'Advanced settings and debugging tools',
                info: 'Info',
                backToHome: 'Back to home',
                accessDenied: {
                    title: 'Access denied',
                    body: 'You do not have administrator permission for this area.',
                    securityDetailsTitle: 'Security details:',
                    serverValidated: 'Admin status is validated on the server',
                    noClientBypass: 'Client-side manipulation is not possible',
                    unknownError: 'Unknown validation error'
                },
                userInfo: {
                    title: 'Administrator status',
                    currentUser: 'Current user:',
                    email: 'Email:',
                    userId: 'User ID:',
                    adminStatus: 'Admin status:',
                    adminYes: '✓ Administrator',
                    unknown: 'Unknown',
                    notAvailable: 'Not available'
                },
                system: {
                    title: 'System information',
                    devMode: 'Development mode:',
                    devActive: 'Active',
                    devInactive: 'Inactive',
                    reactVersion: 'React version:',
                    browser: 'Browser:',
                    resolution: 'Screen resolution:'
                },
                tools: {
                    title: 'Administrator tools',
                    devToolsTitle: 'Developer tools',
                    devToolsDesc: 'Use the browser console for advanced admin functions: adminUtils.checkCurrentUserStatus(), adminUtils.enableDebugPanel(), etc.',
                    enableDebugPanel: 'Enable debug panel',
                    disableDebugPanel: 'Disable debug panel',
                    devTestingPanel: 'Developer Testing Panel',
                    clearLocalStorage: 'Reset LocalStorage'
                },
                modal: {
                    title: 'Admin Panel Information',
                    ok: 'Understood',
                    welcome: 'Welcome to the Admin Panel!',
                    intro: 'This panel provides advanced features for managing and monitoring the application:',
                    bullets: {
                        debug: 'Debug Panel: Monitor API requests and errors in real time',
                        system: 'System Info: View important system data',
                        devtools: 'Developer Tools: Access advanced debugging functions',
                        settings: 'Settings Management: Control debug features'
                    },
                    noteTitle: 'Note',
                    noteDesc: 'Administrator functions are only available to authorized users and should be used with caution.'
                },
                cache: {
                    title: 'Image Cache Management',
                    refresh: 'Refresh',
                    loading: 'Loading cache information...',
                    usage: 'Cache usage',
                    usedOf: '{{size}} of {{max}} used',
                    maxMB: '10 MB',
                    labels: {
                        imagesStored: 'Stored images',
                        cacheSize: 'Cache size',
                        oldestImage: 'Oldest image'
                    },
                    buttons: {
                        cleanExpired: 'Remove expired',
                        clearAll: 'Clear cache'
                    },
                    confirm: {
                        clearTitle: 'Are you sure you want to clear the entire cache?',
                        ok: 'Yes, clear',
                        cancel: 'Cancel'
                    },
                    info: {
                        title: 'Cache information',
                        line1: '• Group images are automatically compressed and stored locally',
                        line2: '• Cache is automatically cleaned after 7 days',
                        line3: '• Maximum cache size 10 MB',
                        line4: '• Reduces network traffic and improves load times'
                    },
                    toasts: {
                        cleanedExpired: 'Expired images removed',
                        cleanError: 'Error cleaning cache',
                        clearedAll: 'Cache cleared',
                        clearError: 'Error clearing cache'
                    }
                }
                ,
                settings: {
                    title: 'Admin settings',
                    adminAreaTitle: 'Administrator area',
                    adminAreaDesc: 'These settings are only visible to administrators.',
                    apiDebugPanel: 'API Debug Panel',
                    apiDebugPanelDesc: 'Displays a draggable debug button for API monitoring',
                    switchOn: 'ON',
                    switchOff: 'OFF',
                    debugFunctionsTitle: 'Debug features:',
                    features: {
                        monitoring: 'API request monitoring',
                        errorTracking: 'Error tracking and analysis',
                        performance: 'Performance metrics',
                        draggable: 'Draggable button (above bottom navigation on mobile)',
                        exportable: 'Exportable logs'
                    },
                    panelActiveTitle: 'Debug panel active',
                    panelActiveDesc: 'The draggable debug button is now available. Click it to open the debug panel.'
                }
                ,
                devPanel: {
                    accessDeniedTitle: 'Access denied - Developer Testing Panel',
                    testingToolsOnly: 'Testing tools are for authorized developers only',
                    title: 'Developer Testing Panel',
                    subtitle: 'Comprehensive testing tools for developers and system administrators to verify error handling, logging systems, and application stability.',
                    info: {
                        title: '🔬 Developer testing area',
                        desc: 'These tools are designed specifically for testing and validating application stability.',
                        bullets: {
                            errorBoundary: 'ErrorBoundary testing: Test React error boundaries and error logging',
                            errorLogging: 'Error logging: Check localStorage and server logging functions',
                            emailNotifications: 'Email notifications: Validate critical error notifications',
                            recovery: 'Recovery testing: Test application recovery mechanisms'
                        }
                    },
                    env: {
                        title: 'Environment information',
                        fields: {
                            mode: 'Mode:',
                            apiUrl: 'API URL:',
                            errorNotifications: 'Error notifications:',
                            user: 'User:'
                        },
                        values: {
                            enabled: 'Enabled',
                            criticalOnly: 'Critical only'
                        }
                    },
                    testing: {
                        title: 'ErrorBoundary & error testing',
                        warningTitle: '⚠️ Caution when testing',
                        warningDesc: 'These tests trigger real errors. In development the React error overlay appears — close it with the X to see the ErrorBoundary UI. In production users only see the friendly error page.'
                    },
                    logs: {
                        title: '🔍 Error Logs Inspector',
                        instructions: 'Run these commands in the browser console:'
                    }
                    ,
                    errorTester: {
                        cardTitle: '🧪 ErrorBoundary tester',
                        infoAlertTitle: 'ℹ️ Test categories',
                        infoAlertDesc1: '🟢 Caught by ErrorBoundary: render-cycle errors',
                        infoAlertDesc2: '🔴 NOT caught: async errors, event handlers, network requests',
                        infoAlertDesc3: '📝 All tests are logged: check the browser console',
                        sections: {
                            caught: '🟢 Caught by ErrorBoundary:',
                            uncaught: '🔴 NOT caught by ErrorBoundary:',
                            proper: '✅ CORRECT error handling — approaches:'
                        },
                        buttons: {
                            throwError: '🚨 Standard React error',
                            typeError: '💥 Trigger TypeError',
                            referenceError: '🔍 Trigger ReferenceError',
                            networkErrorSim: '🌐 Simulate network error',
                            realNetworkError: '🌐 Real network error',
                            asyncError: '⏰ Async error',
                            eventHandlerError: '🖱️ Event handler error',
                            properNetwork: '✅ Handle network error correctly',
                            properAsync: '✅ Handle async error correctly'
                        },
                        messages: {
                            networkLoading: 'Network request in progress...',
                            networkSuccess: 'Network request successful!',
                            networkUserError: 'Network error: Please check your internet connection.',
                            asyncLoading: 'Async operation in progress...',
                            asyncSuccess: 'Async operation successful!',
                            asyncFailedTitle: 'Async operation failed',
                            asyncFailedDesc: 'A deferred operation failed. The error was logged.',
                            asyncFailedMsg: 'Async operation failed',
                            userActionFailedTitle: 'User action failed',
                            userActionFailedDesc: 'An error occurred while processing your action. Please try again.',
                            clearLogsSuccess: 'All error logs have been cleared'
                        }
                    }
                }
            },
            notifications: {
                apiErrorTitle: 'API Error',
                apiLoadedTitle: 'Success',
                apiLoadedDesc: 'Data loaded successfully.',
                saveSuccessTitle: 'Saved successfully',
                saveSuccessDesc: 'Changes have been saved successfully.'
            },
            breadcrumb: {
                newItem: 'New Item',
                editItem: 'Edit Item',
                itemDetails: 'Item Details',
                emergency: 'Emergency Preparedness',
            },
            navbar: {
                adminPanel: 'Admin Panel',
                newItem: 'Create New',
                new: 'New',
                logout: 'Logout',
            },
            auth: {
                resetSuccess: {
                    title: 'Password reset',
                    defaultMessage: 'Password has been reset successfully.',
                    toLogin: 'Go to login'
                },
                protected: {
                    accessDeniedTitle: 'Access denied',
                    accessDeniedBody1: 'You do not have administrator permissions for this area.',
                    securityNote: 'Security note: Admin permissions are validated on the server and cannot be bypassed by client manipulation.',
                    notLoggedIn: 'Not logged in',
                    adminRequired: 'Admin permission required',
                    unauthorized: 'Unauthorized',
                    sessionExpired: 'Session expired',
                    serverValidationFailed: 'Server validation failed'
                },
                securityWarning: {
                    title: '⚠️ Security notice for developers',
                    adminValidated: 'Admin permission is now validated on the server!',
                    note1: 'Manually setting user.isAdmin = true in localStorage no longer works. All admin areas are protected by JWT tokens and backend validation.',
                    note2: 'For development purposes: Use the backend API to set admin status.'
                }
            },
            user: {
                title: 'User profile & group management',
                tabs: {
                    profile: 'Profile',
                    groups: 'Groups'
                },
                form: {
                    labels: {
                        username: 'Username',
                        email: 'Email address',
                        passwordNew: 'New password (optional)',
                        persons: 'Persons in household',
                        profileImage: 'Profile image'
                    },
                    validation: {
                        usernameRequired: 'Please enter a username',
                        usernameMin: 'Username must be at least 3 characters long.',
                        usernameTrim: 'Username cannot start/end with spaces.',
                        emailRequired: 'Please enter an email',
                        emailInvalid: 'Invalid email',
                        passwordMin: 'Password must be at least 6 characters long.',
                        personsNumber: 'Please enter a number'
                    },
                    placeholders: {
                        passwordOptional: 'New password (if changing)'
                    },
                    upload: {
                        onlyImages: 'Images only.',
                        uploadSuccess: 'Image uploaded successfully',
                        uploadError: 'Error loading image.',
                        selectImage: 'Upload image'
                    },
                    buttons: {
                        updateProfile: 'Update profile'
                    }
                }
            },
            groups: {
                header: 'Group management',
                buttons: {
                    create: 'Create group',
                    join: 'Join group',
                    edit: 'Edit',
                    delete: 'Delete',
                    leave: 'Leave',
                    members: 'Members',
                    remove: 'Remove',
                    close: 'Close'
                },
                empty: {
                    title: 'No groups found',
                    subtitle: 'Create a new group or join an existing one.'
                },
                labels: {
                    inviteCode: 'Invite code',
                    groupName: 'Group name',
                    descriptionOptional: 'Description (optional)',
                    groupImageOptional: 'Group image (optional)',
                    creator: 'Creator',
                    role: {
                        admin: 'Administrator',
                        member: 'Member'
                    }
                },
                placeholders: {
                    groupName: 'e.g., Smith family',
                    groupDescription: 'Group description...'
                },
                confirms: {
                    deleteTitle: 'Are you sure you want to delete this group?',
                    leaveTitle: 'Are you sure you want to leave this group?',
                    removeUserTitle: 'Are you sure you want to remove {{username}} from the group?',
                    ok: 'Yes',
                    cancel: 'No'
                },
                toasts: {
                    created: 'Group created successfully',
                    updated: 'Group updated successfully',
                    deleted: 'Group deleted successfully',
                    left: 'Left group successfully',
                    removedUser: 'User removed from group successfully',
                    joinSuccess: 'Successfully joined the group "{{name}}"',
                    loadMembersError: 'Failed to load group members',
                    inviteCopied: 'Invite code copied',
                    imageSelectError: 'Please select an image file',
                    imageTooLarge: 'Image must be smaller than 5MB',
                    imageCompressed: 'Image compressed ({{ratio}}% smaller)',
                    imageCompressionError: 'Image compression failed'
                },
                ui: {
                    compressing: 'Compressing...',
                    selectImage: 'Select image',
                    changeImage: 'Change image',
                    chooseAnotherImage: 'Choose another image',
                    removeCurrentImage: 'Remove current image',
                    removeNewSelection: 'Remove new selection',
                    supportedFormats: 'Supported formats: JPG, PNG, GIF (max. 5MB)',
                    imagesOptimized: 'Images are optimized automatically',
                    imageBeingCompressed: 'Image is being compressed...'
                },
                modals: {
                    createTitle: 'Create new group',
                    editTitle: 'Edit group',
                    joinTitle: 'Join group',
                    membersTitle: 'Members of "{{name}}"',
                    cancel: 'Cancel',
                    create: 'Create',
                    save: 'Save',
                    join: 'Join'
                }
            },
            invites: {
                processingOne: 'Joining group "{{name}}"...',
                processingMany: 'Joining {{count}} groups...',
                successOne: '✅ Successfully joined the group "{{name}}"!',
                successMany: '✅ Successfully joined {{count}} groups!',
                timeout: 'Joining group is taking too long. Please try again later.',
                error: 'Error joining a group. Please try again.'
            },
            detail: {
                noIdError: 'No ID found',
                loadingItems: 'Loading storage items ...',
                imageLoading: 'Image is loading...',
                sections: {
                    basics: 'Basics',
                    details: 'Details',
                    packaging: 'Packaging',
                    nutrients: 'Nutrients',
                },
                labels: {
                    id: 'ID',
                    amount: 'Amount',
                    unit: 'Unit',
                    categories: 'Categories',
                    lowThreshold: 'Threshold (low)',
                    midThreshold: 'Threshold (mid)',
                    storageLocation: 'Storage location',
                    packageQty: 'Package quantity',
                    packageUnit: 'Package unit',
                },
                nutrientsHeader: 'Nutrition per {{amount}} {{unit}}',
                table: {
                    value: 'Value',
                    unit: 'Unit',
                },
                buttons: {
                    back: 'Back to overview',
                    edit: 'Edit',
                    delete: 'Delete',
                },
            },
            form: {
                notifications: {
                    imageProcessing: 'Processing image...',
                    invalidImageData: 'Invalid image data',
                    imageCompressedInfo: 'Image was compressed for better performance',
                    imageLoadedSuccess: 'Image loaded successfully',
                    imageProcessError: 'Error processing image',
                    createdSuccess: 'Item created successfully',
                    updatedSuccess: 'Item updated successfully'
                },
                steps: {
                    base: 'Basics',
                    details: 'Details',
                    packaging: 'Packaging',
                    image: 'Image',
                    nutrients: 'Nutrients',
                },
                common: {
                    popular: 'Popular',
                },
                labels: {
                    name: 'Name',
                    amount: 'Amount',
                    unitOptional: 'Unit (optional)',
                    categories: 'Categories',
                    storageLocation: 'Storage location',
                    lowThreshold: 'Threshold (low)',
                    midThreshold: 'Threshold (mid)',
                    packageSize: 'Package size',
                    packageUnit: 'Package unit',
                    imagePreview: 'Image preview',
                    uploadImage: 'Upload image',
                    removeImage: 'Remove image',
                },
                placeholders: {
                    name: 'Name',
                    amount: 'Amount (number)',
                    unit: 'e.g., pcs, kg, l — or enter a custom value',
                    categories: 'Enter or select a category',
                    storageLocation: 'Enter or select a storage location',
                    lowThreshold: 'e.g., 2 — warns at stock ≤ 2',
                    midThreshold: 'e.g., 5 — additional warning level',
                    packageSize: 'e.g., 6',
                    packageUnit: 'e.g., pcs, pack — or enter a custom value',
                    nutrientAmount: 'e.g., 100',
                    nutrientUnit: 'Unit',
                    colorCode: 'Color code',
                    nutrientName: 'Nutrient',
                    nutrientValue: 'Value (number)',
                },
                nutrientsHeader: 'Nutrition per {{amount}} {{unit}}',
                buttons: {
                    toOverview: 'Back to overview',
                    back: 'Back',
                    next: 'Next',
                    save: 'Save',
                    cancel: 'Cancel',
                    removeNutrient: 'Remove nutrient',
                    addNutrient: 'Add nutrient',
                },
            },
            storage: {
                drawerTitle: 'Filter & Sorting',
                activeCountSuffix: 'active',
                clearFilters: 'Reset filters',
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
            utils: {
                image: {
                    emptyData: 'Empty image data',
                    invalidBase64Format: 'Invalid Base64 format',
                    invalidMimeType: 'Invalid MIME type',
                    unsupportedFormat: 'Unsupported image format: {{format}}. Supported: {{supported}}',
                    invalidBase64: 'Invalid Base64 encoding',
                    imageTooLarge: 'Image is too large ({{size}}MB, max 5MB)',
                    canvasContextUnavailable: 'Canvas context unavailable',
                    loadError: 'Error loading image',
                    fileTypeOnlyImages: 'Only image files are allowed',
                    fileTooLarge: 'File is too large (max 5MB)',
                    fileReadError: 'Error reading file',
                    repairFailed: 'Repair of Base64 data failed',
                    repairError: 'Repair error: {{error}}',
                    processingError: 'Image processing error: {{error}}'
                },
                api: {
                    category: {
                        network: 'Network error',
                        imageData: 'Image data error',
                        badRequest: 'Bad request',
                        auth: 'Authentication',
                        permission: 'Permission',
                        notFound: 'Not found',
                        validation: 'Validation error',
                        server: 'Server error',
                        unknown: 'Unknown error'
                    },
                    suggestion: {
                        network: 'Check your internet connection and whether the server is reachable.',
                        imageData: 'The image format is invalid or the file is too large. Use JPG/PNG under 5MB.',
                        badRequest: 'Check the submitted data for completeness and correct formats.',
                        auth: 'You are not logged in or your session has expired. Please log in again.',
                        permission: 'You do not have permission for this action.',
                        notFound: 'The requested item does not exist or has been deleted.',
                        validation: 'The data does not meet requirements. Check all required fields.',
                        server: 'An internal server error occurred. Please try again later.',
                        unknown: 'An unexpected error occurred. Contact support if the problem persists.'
                    },
                    debug: {
                        serverResponse: 'Server response:'
                    }
                }
            }
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
