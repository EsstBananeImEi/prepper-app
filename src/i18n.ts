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
                password: 'Passwort',
                filter: 'Filter',
                filter_with_count: 'Filter ({{count}})',
                filter_open: 'Filter öffnen',
                filter_open_active: 'Filter öffnen – {{count}} aktiv',
            },
            search: {
                placeholder: 'Suche nach Items, Checkliste, Kategorien oder Seiten...',
                no_results: 'Keine Ergebnisse gefunden',
                labels: {
                    storageStock: 'Lagerbestand',
                    cart: 'Einkaufswagen',
                    emergency: 'Notfallvorsorge',
                    page: 'Seite',
                    checklist: 'Checkliste'
                },
                pages: {
                    storage: 'Lagerbestand',
                    checklist: 'Checkliste',
                    basket: 'Einkaufsliste',
                    addItem: 'Neues Item hinzufügen'
                }
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
            emergency: {
                toc: 'Inhaltsverzeichnis',
                titles: {
                    lebensmittel: 'Lebensmittelvorrat',
                    wasser: 'Trinkwasservorrat',
                    medikamente: 'Medikamente & Erste-Hilfe',
                    dokumente: 'Wichtige Dokumente',
                    hygiene: 'Hygiene & Desinfektion',
                    informieren: 'Notfallausrüstung & Kommunikation',
                    gepaeck: 'Notfallgepäck & Fluchtrucksack',
                    sicherheit: 'Sicherheit im Haus',
                    beduerfnisse: 'Spezielle Bedürfnisse'
                },
                sections: {
                    why: 'Warum bevorraten?',
                    storageType: 'Welcher Vorratstyp sind Sie?',
                    tips: 'Tipps für die Zusammenstellung eines Vorrats',
                    storageAndTreatment: 'Lagerung & Aufbereitung',
                    waterTips: 'Tipps zur Trinkwasservorrat',
                    wellPrepared: 'So sind Sie gut vorbereitet',
                    storageHints: 'Hinweise zur richtigen Aufbewahrung',
                    homePharmacyContents: 'Das gehört in eine Hausapotheke',
                    upToDate: 'Immer auf dem aktuellen Stand',
                    allInOnePlace: 'Alles Wichtige an einem Platz',
                    documentFolderContents: 'Das gehört in die Dokumentenmappe',
                    updateAndSecure: 'Tipps zur Aktualisierung & Sicherung',
                    hygienePrepare: 'Vorsorgen für Notsituationen',
                    hygieneActions: 'Das können Sie tun',
                    hygieneStock: 'Das sollten Sie vorrätig haben',
                    whyEquipment: 'Warum Notfallausrüstung?',
                    emergencyDevices: 'Notfallgeräte',
                    communication: 'Kommunikationsmittel',
                    radioFrequencies: 'Funk & Radio Frequenzen',
                    tipsTricks: 'Tipps und Tricks',
                    whyBackpack: 'Warum ein Fluchtrucksack?',
                    whenBackpack: 'Wann braucht man einen Fluchtrucksack?',
                    backpackChoice: 'Die Wahl des richtigen Rucksacks',
                    backpackContents: 'Was gehört in den Fluchtrucksack?',
                    backpackSystem: 'Notfallrucksack System',
                    packingLists: 'Packlisten',
                    prepTips: 'Tipps zur Vorbereitung',
                    storagePlace: 'Wo lagere ich den Notfallrucksack?',
                    readyKitsAvailable: 'Gibt es fertige Notfallrucksäcke zu kaufen?',
                    safetyWhyHome: 'Warum Sicherheit im Haus?',
                    safetyMeasures: 'Bauliche & technische Maßnahmen',
                    safetyMaintenanceEvac: 'Tipps zur Wartung & Evakuierungsplanung'
                },
                content: {
                    lebensmittel: {
                        why: {
                            intro: 'Ein Vorrat an Lebensmitteln und Getränken kann in vielen Situationen hilfreich sein:',
                            b1: 'Wenn Sie das Haus nicht zum Einkaufen verlassen können, weil Hochwasser oder starke Schneefälle Supermärkte unerreichbar machen.',
                            b2: 'Wenn Sie sich aufgrund einer akuten Erkrankung schonen und im Bett bleiben sollten.',
                            b3: 'Wenn ein schwerer Sturm oder ein Unwetter tobt und Sie im Freien verletzt werden könnten.',
                            b4: 'Wenn es eingeschränkte Möglichkeiten gibt, an Nahrung oder Trinkwasser zu gelangen – z. B. bei großflächigen Stromausfällen oder Lieferengpässen durch Pandemien, Cyberangriffe oder Dürre.',
                            outro: 'Wir möchten Sie mit unseren Tipps dabei unterstützen, einen Vorrat anzulegen, der gut zu Ihrem Bedarf passt.'
                        },
                        storageType: {
                            intro: 'Es gibt verschiedene Ansätze, einen Lebensmittel- und Getränkevorrat anzulegen:',
                            once: {
                                title: 'Einmaliger Vorrat:',
                                i1: 'Kaufen: Legen Sie einmalig einen größeren Vorrat für 10 Tage an.',
                                i2: 'Prüfen: Kontrollieren Sie regelmäßig die Haltbarkeit, z. B. einmal jährlich, und verbrauchen Sie bald ablaufende Produkte zuerst.',
                                i3: 'Erneuern: Ersetzen Sie abgelaufene oder verbrauchte Produkte zeitnah.'
                            },
                            live: {
                                title: 'Lebender Vorrat:',
                                i1: 'Kaufen: Nehmen Sie bei jedem Einkauf etwas zusätzlich mit, um allmählich einen Vorrat aufzubauen.',
                                i2: 'Verbrauchen: Nutzen Sie den Vorrat regelmäßig und erneuern Sie ihn kontinuierlich.',
                                i3: 'Erneuern: Kaufen Sie Verbrauchtes bei Ihren nächsten Einkäufen nach, sodass Ihr Vorrat immer aktuell bleibt.'
                            }
                        },
                        tips: {
                            intro: 'Ein Vorrat ist sehr individuell – hier einige allgemeine Empfehlungen:',
                            b1: 'Wie viele Lebensmittel? Wir empfehlen einen Vorrat für 10 Tage. Wer noch sicherer gehen möchte, kann den Vorrat auf bis zu 10 Tage erweitern.',
                            b2: 'Wie viel Flüssigkeit? Ein Erwachsener benötigt mindestens 1,5 Liter pro Tag plus ca. 0,5 Liter fürs Kochen.',
                            b3: 'Welches Essen? Orientieren Sie sich an Ihrem täglichen Verbrauch – ob einfache Grundversorgung oder abwechslungsreiche Kost.',
                            b4: 'Haltbarkeit: Bevorzugen Sie Lebensmittel, die ohne Kühlung lange haltbar sind.',
                            b5: 'Fertigprodukte: Produkte, die nicht gekocht werden müssen, sind ideal, wenn Herd und Kochmöglichkeiten ausfallen.',
                            b6: 'Kurze Kochzeit: Lebensmittel, die mit wenig Energie zubereitet werden, schonen Ressourcen.',
                            b7: 'Besondere Bedürfnisse: Berücksichtigen Sie Allergien, Essgewohnheiten oder Vorräte für Kinder und Haustiere.',
                            outro: 'Geeignete Lebensmittel umfassen unter anderem Reis, Nudeln, Trockenfrüchte, Konserven, Nüsse, Zwieback und Müsliriegel.'
                        }
                    },
                    wasser: {
                        why: {
                            p1: 'Wasser ist lebenswichtig – ein Erwachsener kann nur wenige Tage ohne Flüssigkeit auskommen. Bei Naturkatastrophen, Stromausfällen oder anderen Krisensituationen kann die öffentliche Wasserversorgung schnell zusammenbrechen.',
                            p2: 'Daher ist es unerlässlich, einen ausreichenden Trinkwasservorrat anzulegen, um im Notfall autark zu bleiben.'
                        },
                        storageAndTreatment: {
                            p1: 'Lagern Sie Wasser in lebensmittelechten Kanistern oder Flaschen und überprüfen Sie regelmäßig den Zustand der Behälter. Achten Sie darauf, dass diese an einem kühlen, dunklen Ort aufbewahrt werden, um eine längere Haltbarkeit zu gewährleisten.',
                            p2: 'Im Falle einer Kontamination können Wasserfilter und Aufbereitungstabletten helfen, die Qualität wiederherzustellen.'
                        },
                        tips: {
                            b1: 'Planen Sie mindestens 2 Liter pro Person und Tag ein.',
                            b2: 'Erwägen Sie einen zusätzlichen Puffer, falls die Versorgung länger ausfällt.',
                            b3: 'Testen Sie regelmäßig Ihre Wasseraufbereitungsmethoden und -geräte.',
                            b4: 'Nutzen Sie alternative Quellen wie Regenwasser – nur, wenn eine fachgerechte Aufbereitung möglich ist.'
                        }
                    },
                    medikamente: {
                        wellPrepared: {
                            p1: 'Planen Sie vorausschauend und machen Sie sich Gedanken bei der Zusammenstellung Ihrer Hausapotheke. Sie ist besonders wichtig, wenn Sie in einer Notsituation Ihr Zuhause nicht verlassen sollten – etwa bei starkem Unwetter. In solchen Fällen ist es hilfreich, einige Medikamente und Verbandsmaterialien vorrätig zu haben, um Verletzungen oder leichtere Erkrankungen behandeln zu können.',
                            p2: 'Füllen Sie Ihren Vorrat rechtzeitig auf, bevor er verbraucht ist, und achten Sie dabei auf eine sinnvolle Mischung aus Standard- und persönlichen Medikamenten.'
                        },
                        storageHints: {
                            p1: 'Bewahren Sie Ihre Hausapotheke in einem abschließbaren Schrank oder Fach auf. Achten Sie darauf, dass sie für Kinder nicht zugänglich ist – idealerweise in einem hoch hängenden oder abschließbaren Fach mit separatem Verbandsbereich.',
                            p2: 'Wählen Sie einen kühlen, trockenen Raum – das Badezimmer ist aufgrund der Feuchtigkeit ungeeignet.'
                        },
                        homePharmacyContents: {
                            intro: 'Empfohlen werden unter anderem:',
                            b1: 'Persönliche, vom Arzt verschriebene Medikamente',
                            b2: 'Schmerz- und fiebersenkende Mittel',
                            b3: 'Mittel gegen Erkältungskrankheiten',
                            b4: 'Mittel gegen Durchfall, Übelkeit, Erbrechen',
                            b5: 'Mittel gegen Insektenstiche und Sonnenbrand',
                            b6: 'Elektrolyte zum Ausgleich bei Durchfallerkrankungen',
                            b7: 'Fieberthermometer',
                            b8: 'Splitterpinzette',
                            b9: 'Hautdesinfektionsmittel',
                            b10: 'Wunddesinfektionsmittel',
                            b11: 'Einweghandschuhe',
                            b12: 'Atemschutzmaske',
                            b13: 'Verbandsmaterial (z.B. Mull-Kompresse, Verbandschere, Pflaster, Binden, Dreiecktuch)'
                        },
                        upToDate: {
                            p1: 'Achten Sie darauf, dass Ihre Hausapotheke keine Medikamente enthält, deren Haltbarkeitsdatum überschritten ist! Viele Haushalte sammeln abgelaufene Medikamente, was gefährlich werden kann, da deren Wirksamkeit verloren geht oder sie sogar schädlich sein können.',
                            p2: 'Kontrollieren Sie Ihre Hausapotheke regelmäßig, sortieren Sie abgelaufene Produkte aus und füllen Sie verbrauchte Bestandteile zeitnah auf. Entsorgen Sie abgelaufene Medikamente im Hausmüll.'
                        }
                    },
                    dokumente: {
                        allInOnePlace: {
                            p1: 'Wichtige Dokumente wiederzubeschaffen kann schwierig – in manchen Fällen sogar unmöglich sein. Arbeitszeugnisse und andere Qualifizierungsnachweise unterliegen oft kürzeren Aufbewahrungsfristen als Abschlusszeugnisse.',
                            p2: 'Denken Sie rechtzeitig darüber nach, was für Sie essenziell ist. Stellen Sie alle wichtigen Dokumente in einer Dokumentenmappe zusammen und bewahren Sie diese an einem Ort griffbereit auf. Für den Notfall sollten alle Familienmitglieder den Standort der Mappe kennen. Zudem ist es sinnvoll, Kopien wichtiger Dokumente digital zu sichern oder an einem alternativen Ort zu hinterlegen – beispielsweise bei Verwandten, Freunden, einem Notar oder in einem Bankschließfach.'
                        },
                        documentFolderContents: {
                            intro: 'Eine Dokumentenmappe ist sehr individuell – es hängt von Ihren persönlichen Lebensumständen ab, welche Unterlagen für Sie wichtig sind. Hier einige Beispiele:',
                            titles: {
                                original: 'Im Original:',
                                originalOrCertified: 'Im Original oder als beglaubigte Kopie:',
                                copies: 'Als einfache Kopie:'
                            },
                            original: {
                                b1: 'Familienurkunden (Geburts-, Heirats-, Sterbeurkunden) bzw. das Stammbuch'
                            },
                            originalOrCertified: {
                                b1: 'Sparbücher, Kontoverträge, Aktien, Wertpapiere, Versicherungspolicen',
                                b2: 'Renten-, Pensions- und Einkommensbescheinigungen, Einkommenssteuerbescheide',
                                b3: 'Qualifizierungsnachweise: Zeugnisse (Schulzeugnisse, Hochschulzeugnisse, Nachweise über Zusatzqualifikationen)',
                                b4: 'Verträge und Änderungsverträge (z.B. Mietverträge, Leasingverträge)',
                                b5: 'Testament, Patientenverfügung und Vollmacht'
                            },
                            copies: {
                                b1: 'Personalausweis, Reisepass',
                                b2: 'Führerschein und Fahrzeugpapiere',
                                b3: 'Impfpass',
                                b4: 'Grundbuchauszüge',
                                b5: 'Änderungsbescheide für empfangene Leistungen',
                                b6: 'Zahlungsbelege für Versicherungsprämien (insbesondere Rentenversicherung)',
                                b7: 'Meldenachweise der Arbeitsämter, Bescheide der Agentur für Arbeit',
                                b8: 'Rechnungen, die offene Zahlungsansprüche belegen',
                                b9: 'Mitglieds- oder Beitragsbücher von Verbänden, Vereinen oder sonstigen Organisationen'
                            }
                        },
                        updateAndSecure: {
                            b1: 'Erstellen Sie Duplikate und digitale Kopien Ihrer wichtigsten Dokumente.',
                            b2: 'Lagern Sie Ihre Dokumente in einer wasserdichten und feuerfesten Mappe oder in einem Safe.',
                            b3: 'Informieren Sie alle Familienmitglieder über den Aufbewahrungsort.',
                            b4: 'Überprüfen Sie regelmäßig die Vollständigkeit und Aktualität Ihrer Unterlagen.'
                        }
                    },
                    hygiene: {
                        prepare: {
                            p1: 'Bei Katastrophen oder länger andauernden Notfällen – etwa einem großflächigen Stromausfall – kann es passieren, dass kein Leitungswasser mehr verfügbar ist. Um den Zeitraum zu überbrücken, bis staatliche Hilfe eintrifft, können Sie durch gezielte Vorsorgemaßnahmen dafür sorgen, dass auch in solchen Situationen für ausreichend Hygiene gesorgt ist.'
                        },
                        actions: {
                            intro: 'Wenn sich eine längere Wasserversorgungsausfall abzeichnet – beispielsweise durch Bauarbeiten oder einen Stromausfall, bei dem noch restliches Wasser in den Leitungen ist – sollten Sie folgendes beachten:',
                            b1: 'Sammeln Sie Wasser in allen verfügbaren größeren Gefäßen (Badewanne, Waschbecken, Eimer, Töpfe, Wasserkanister) und nutzen Sie es als Brauchwasser, auch für die Toilettenspülung.',
                            b2: 'Gehen Sie sparsam mit dem Wasser um: Verwenden Sie bei länger andauernder Knappheit Einweggeschirr und -besteck, um Wasser für das Spülen zu sparen.',
                            b3: 'Nutzen Sie alternative Reinigungsmittel, die wenig oder gar kein Wasser benötigen – zum Beispiel Trockenshampoo oder spezielle Handwaschpasten.',
                            b4: 'Verwenden Sie Feucht- und Desinfektionstücher zur Handreinigung.',
                            b5: 'Setzen Sie Haushaltspapier oder feuchte Putztücher zur Reinigung ein.',
                            b6: 'Benutzen Sie Haushaltshandschuhe, um den direkten Kontakt mit Schmutz zu vermeiden.',
                            b7: 'Setzen Sie, falls möglich, eine Campingtoilette mit Ersatzflüssigkeit ein.',
                            b8: 'Machen Sie das gesammelte Brauchwasser länger haltbar, indem Sie geeignete Entkeimungsmittel hinzufügen – lassen Sie sich hierzu im Camping- oder Outdoorhandel beraten.'
                        },
                        stock: {
                            intro: 'Um auch in Notsituationen die Hygiene aufrechtzuerhalten, empfiehlt sich die Vorratshaltung folgender Produkte:',
                            b1: 'Seife',
                            b2: 'Waschmittel',
                            b3: 'Zahnpasta und Zahnbürste',
                            b4: 'Feuchttücher',
                            b5: 'Desinfektionstücher',
                            b6: 'Weitere Hygieneartikel (z.B. für Monatshygiene, Windeln)',
                            b7: 'Toilettenpapier',
                            b8: 'Haushaltspapier',
                            b9: 'Müllbeutel',
                            b10: 'Haushaltshandschuhe',
                            b11: 'Desinfektionsmittel',
                            b12: 'Campingtoilette samt Ersatzbeutel und Ersatzflüssigkeit',
                            outro: 'Eine Checkliste zur Hygiene in Notzeiten finden Sie im Ratgeber für Notfallvorsorge und richtiges Handeln in Notsituationen.'
                        }
                    },
                    informieren: {
                        whyEquipment: {
                            p1: 'In Krisensituationen können Stromausfälle und Kommunikationsstörungen den Alltag stark beeinträchtigen. Notfallausrüstung stellt sicher, dass Sie auch ohne reguläre Infrastruktur informiert und handlungsfähig bleiben – sei es zur Notfallkommunikation oder zur Stromversorgung wichtiger Geräte.'
                        },
                        emergencyDevices: {
                            intro: 'Für den Fall, dass herkömmliche Strom- und Kommunikationssysteme ausfallen, sollten Sie folgende Geräte bereithalten:',
                            b1: 'Batteriebetriebene Radios',
                            b2: 'Kurbel- oder Solarladegeräte',
                            b3: 'Ersatzbatterien und Powerbanks',
                            b4: 'Taschenlampen',
                            b5: 'Gegebenenfalls Funkgeräte für den direkten Informationsaustausch'
                        },
                        communication: {
                            p1: 'Auch wenn die regulären Netzwerke ausfallen, sollten Sie sicherstellen, dass Sie erreichbar bleiben und Informationen austauschen können:',
                            b1: 'Nutzen Sie ein Notfallhandy mit langer Akkulaufzeit oder ein Zweitgerät, falls Ihr Hauptgerät ausfällt.',
                            b2: 'Halten Sie wichtige Telefonnummern und Kontaktdaten in Papierform bereit.',
                            b3: 'Informieren Sie sich über lokale Warnsysteme und Notfallmeldungen.',
                            b4: 'Verwenden Sie soziale Medien und Messenger-Dienste (z.B. WhatsApp, Telegram, Signal, Facebook) für den Informationsaustausch.',
                            b5: 'Installieren Sie Apps von Behörden und Organisationen wie WarnWetter, NINA oder KATWARN, die Sie über Unwetter, Brände, Hochwasser und andere Gefahren informieren.'
                        },
                        radioFrequencies: {
                            p1: 'In Deutschland gibt es bewährte Funk- und Radiofrequenzen, die im Notfall genutzt werden können, um Hilfe zu rufen oder aktuelle Informationen zu erhalten.',
                            p2: 'Der Notruf 112 ist europaweit gültig und erreicht Feuerwehr sowie Rettungsdienste. Für die Polizei steht in Deutschland der Notruf 110 zur Verfügung.',
                            p3: 'Zudem spielt der Amateurfunk eine wichtige Rolle in der Notfallkommunikation. Funkamateure nutzen Frequenzen im VHF-Bereich (ca. 144 MHz) und im UHF-Bereich (ca. 430 MHz), um in Krisenzeiten unabhängige Kommunikationsnetze aufzubauen.',
                            p4: 'Auch lokale und regionale Radiosender, insbesondere jene des Deutschen Wetterdienstes (DWD) oder öffentlich-rechtliche Rundfunkanstalten, informieren kontinuierlich über Notfälle und aktuelle Entwicklungen.',
                            b1: 'Notrufnummern: 112 (Feuerwehr & Rettungsdienst), 110 (Polizei)',
                            b2: 'Amateurfunk: VHF (ca. 144 MHz), UHF (ca. 430 MHz)',
                            b3: 'Weitere Informationsquellen: Lokale Radiosender sowie Notfall-Apps wie NINA, WarnWetter, KATWARN'
                        },
                        tipsTricks: {
                            b1: 'Testen Sie regelmäßig alle Geräte auf ihre Funktionstüchtigkeit.',
                            b2: 'Bewahren Sie Ihre Notfallausrüstung an einem zentralen und gut zugänglichen Ort auf.',
                            b3: 'Führen Sie eine Checkliste, um die Vollständigkeit und Funktionsfähigkeit der Geräte zu überwachen.'
                        }
                    },
                    gepaeck: {
                        whyBackpack: {
                            p1: 'Ein Fluchtrucksack – oft auch als Bug-Out-Bag (BOB) bezeichnet – dient dazu, im Notfall schnell alles Wichtige griffbereit zu haben. Naturkatastrophen, Brände, Chemieunfälle oder Evakuierungen machen es oft notwendig, das Zuhause kurzfristig zu verlassen.',
                            p2: 'Das Bundesamt für Bevölkerungsschutz und Katastrophenhilfe (BBK) empfiehlt jedem Haushalt, einen gepackten Notfallrucksack bereitzuhalten, um für verschiedene Krisenszenarien vorbereitet zu sein.'
                        },
                        whenBackpack: {
                            intro: 'Die Notwendigkeit eines Fluchtrucksacks hängt vom Szenario ab. Mögliche Situationen sind:',
                            b1: 'Evakuierung wegen Gasleck, Chemieunfall oder Bombenentschärfung',
                            b2: 'Flucht aufgrund von Naturkatastrophen wie Hochwasser, Waldbränden oder Stürmen',
                            b3: 'Stromausfälle oder Versorgungsengpässe',
                            b4: 'Extremfälle: Überleben in der freien Natur für mehrere Tage oder Wochen'
                        },
                        backpackChoice: {
                            p1: 'Der ideale Notfallrucksack sollte robust, wasserfest und ergonomisch sein. Modelle mit einem MOLLE-System bieten den Vorteil, dass sie modular erweiterbar sind – so kann der Rucksack an individuelle Bedürfnisse angepasst werden. Auch das Gewicht spielt eine entscheidende Rolle, da im Ernstfall schnelle Mobilität gefragt ist.',
                            p2Intro: 'Es gibt verschiedene Arten von Rucksäcken:',
                            types: {
                                molle: { title: 'MOLLE-Rucksäcke:', desc: 'Sehr robust, modular erweiterbar, aber schwer' },
                                trekking: { title: 'Trekkingrucksäcke:', desc: 'Optimiert für lange Strecken, leichter als MOLLE-Rucksäcke' },
                                ultra: { title: 'Ultraleichte Rucksäcke:', desc: 'Minimalistisch, sehr leicht, aber weniger strapazierfähig' }
                            }
                        },
                        backpackContents: {
                            intro: 'Neben der Grundausstattung sollten auch spezielle Bedürfnisse berücksichtigt werden:',
                            adult: {
                                title: 'Notfallrucksack für Erwachsene',
                                items: {
                                    b1: 'Dokumente & Wertsachen',
                                    b2: 'Wasser & Verpflegung',
                                    b3: 'Wärmende Kleidung',
                                    b4: 'Hygieneartikel & Erste-Hilfe-Set',
                                    b5: 'Notfallkommunikation (Radio, Powerbank, Taschenlampe)',
                                    b6: 'Survival-Equipment (Messer, Feuerstarter, Wasserfilter)'
                                }
                            },
                            child: {
                                title: 'Notfallrucksack für Kinder',
                                items: {
                                    b1: 'Kindgerechte Kleidung und Wechselkleidung',
                                    b2: 'Beruhigungsmittel oder Lieblingsspielzeug',
                                    b3: 'Snack- und Getränkevorrat',
                                    b4: 'Wichtige persönliche Dokumente'
                                },
                                weightWarning: 'Wichtig: Achten Sie bei Rucksäcken für Kinder auf das Gewicht des gepackten Rucksacks.'
                            },
                            table: {
                                headings: { age: 'Alter', volume: 'Rucksackvolumen', maxWeight: 'Max. Gewicht' },
                                rows: {
                                    r1: { age: '3 – 4', volume: '6 – 9 Liter', weight: '1,5 kg' },
                                    r2: { age: '5 – 6', volume: '10 – 12 Liter', weight: '2 kg' },
                                    r3: { age: '6 – 8', volume: '15 – 18 Liter', weight: '3 kg' },
                                    r4: { age: '8 – 10', volume: '16 – 20 Liter', weight: '5 kg' }
                                }
                            },
                            baby: {
                                title: 'Notfallrucksack für Babys',
                                items: {
                                    b1: 'Windeln, Feuchttücher und Babynahrung',
                                    b2: 'Fläschchen, Ersatzkleidung und Decken',
                                    b3: 'Beruhigungsmittel wie Schnuller',
                                    b4: 'Notwendige Medikamente und Pflegeartikel'
                                }
                            },
                            pet: {
                                title: 'Notfallrucksack für Haustiere',
                                items: {
                                    b1: 'Futter und Wasser für mehrere Tage',
                                    b2: 'Leine, Transportbox oder Maulkorb',
                                    b3: 'Medikamente und tierärztliche Unterlagen',
                                    b4: 'Bekanntes Zubehör (z. B. eine vertraute Decke)'
                                }
                            }
                        },
                        system: {
                            intro: 'Es gibt ein abgestuftes System, um den Notfallrucksack an unterschiedliche Szenarien anzupassen:',
                            lvl1: { title: 'Stufe 1 – Notgepäck', desc: 'Minimalistische Ausstattung – wichtige Dokumente, Bargeld, Mobiltelefon und grundlegende Hygieneartikel.' },
                            lvl2: { title: 'Stufe 2 – Bug out Bag', desc: 'Erweiterte Version für längere Evakuierungen – zusätzlich Nahrung, Wasser, Überlebensausrüstung und ein umfangreicheres Erste-Hilfe-Set.' },
                            lvl3: { title: 'Stufe 3 – INCH Bag', desc: 'Umfassendste Ausstattung für extreme Notfallsituationen – deckt den Bedarf für mehrere Tage ab und beinhaltet erweiterte Survival-Tools, zusätzliche Bekleidung und weiterführende Ausrüstung.' }
                        },
                        packlists: {
                            panelHeaders: {
                                notgepaeck: 'Packliste: Notgepäck',
                                bugout: 'Packliste: Bug out Bag',
                                inchBag: 'Packliste: INCH Bag'
                            },
                            groups: {
                                warmClothes: 'Wärmendes Equipment & Kleidung',
                                food: 'Verpflegung',
                                hygieneFirstAid: 'Hygiene & Erste-Hilfe',
                                otherEquipment: 'Sonstiges Equipment',
                                sleepShelter: 'Schlafen & Unterkunft',
                                clothing: 'Bekleidung',
                                tools: 'Werkzeuge'
                            },
                            notgepaeck: {
                                warmClothes: [
                                    'Leichter Schlafsack oder Decke',
                                    'Wärmende Jacke & wasserdichte Jacke',
                                    '1–2 Paar Wechselsocken, lange Funktionsunterwäsche'
                                ],
                                food: [
                                    '2–3 Liter Wasser',
                                    'Nahrung für 1 bis 2 Tage (Trekkingnahrung, Notnahrung wie NRG5)',
                                    'Snacks & Energieriegel',
                                    'Ess- und Kochgeschirr, ggf. Campingkocher sowie Brennstoffvorrat',
                                    'ggf. Kaffee oder Tee'
                                ],
                                hygieneFirstAid: [
                                    'Kleines Erste-Hilfe-Set mit persönlichen Medikamenten',
                                    'Zahnbürste, Zahnpasta, Damenhygieneartikel',
                                    'Feuchttücher & Seifenkonzentrat',
                                    'Leichtes Reisehandtuch oder schnell trocknendes Trekking-/Outdoorhandtuch',
                                    'Toilettenpapier'
                                ],
                                otherEquipment: [
                                    'SOS-Kapsel für Kinder mit Anschrift und Kontaktdaten',
                                    'Regenhülle für den Rucksack',
                                    'Taschenmesser, Taschenlampe und/oder Stirnlampe',
                                    'Powerbank & Ladegeräte'
                                ]
                            },
                            bugout: {
                                sleepShelter: [
                                    '3-Season Schlafsack & Isomatte',
                                    'Tarp oder leichtes Zelt'
                                ],
                                food: [
                                    'Wasserfilter & Trinkwasserbehälter',
                                    'Verpflegung für 3 bis 5 Tage (gefriergetrocknete Trekkingnahrung oder Notfallrationen)',
                                    'Trinkwasser je nach Umgebung für 1 bis 5 Tage',
                                    'Leichtes Ess- und Kochgeschirr',
                                    'Campingkocher sowie Brennstoffvorrat',
                                    'Zündstahl, Sturmstreichhölzer oder Feuerzeuge',
                                    'Equipment zur Kaffee- oder Teezubereitung (bei Bedarf)'
                                ],
                                clothing: [
                                    'Funktionelle (lange) Unterwäsche',
                                    'Kopfbedeckung und Handschuhe',
                                    '2-3 Paar Socken',
                                    'Hemd/Bluse oder T-Shirt',
                                    'Wärmender Midlayer (z.b. Wolle, Daune oder wattiert)',
                                    'Wasserfeste, robuste Schuhe',
                                    'Robuste Outdoorhose',
                                    'Wasserdichte Jacke & Handschuhe'
                                ],
                                hygieneFirstAid: [
                                    'Erste-Hilfe-Set mit persönlichen Medikamenten',
                                    'Hygieneartikel wie Zahnbürste, Zahnpasta, Damenhygieneartikel und Seifenkonzentrat',
                                    'Leichtes Reisehandtuch oder schnell trocknendes Trekking-/Outdoorhandtuch',
                                    'Feuchttücher & Toilettenpapier'
                                ],
                                otherEquipment: [
                                    'Regenhülle oder Packliner zum Schutz der Ausrüstung',
                                    'Taschen- und/oder Stirnlampe',
                                    'Taschenmesser und/oder Multitool',
                                    'Notfallradio (Kurbel- oder batteriebetrieben)',
                                    'Powerbank und Ladekabel (bei Bedarf)'
                                ]
                            },
                            inchBag: {
                                sleepShelter: [
                                    '4-Season Schlafsack & Isomatte',
                                    'Tarp und/oder leichtes Zelt'
                                ],
                                food: [
                                    'Wasserfilter & Trinkwasserbehälter',
                                    'Verpflegung für mindestens 7 Tage (gefriergetrocknete Trekkingnahrung oder Notfallrationen)',
                                    'Trinkwasser je nach Umgebung für 1 bis 5 Tage',
                                    'Leichtes Ess- und Kochgeschirr',
                                    'Esbitkocher bzw. Bushbox sowie Brennstoffvorrat',
                                    'Zündstahl, Sturmstreichhölzer oder Feuerzeuge',
                                    'Equipment zur Kaffee- oder Teezubereitung (bei Bedarf)'
                                ],
                                clothing: [
                                    'Funktionelle (lange) Unterwäsche',
                                    'Kopfbedeckung und Handschuhe',
                                    'Schal sowie warme Mütze',
                                    '2-3 Paar Socken',
                                    'Hemd/Bluse, T-Shirt',
                                    'Wärmender Pullover (z.b. Wolle, Daune oder wattiert)',
                                    'Wasserfeste, robuste Schuhe',
                                    'Robuste Outdoorhose',
                                    'Wasserdichte, winddichte Jacke',
                                    'Poncho'
                                ],
                                hygieneFirstAid: [
                                    'Erste-Hilfe-Set mit persönlichen Medikamenten',
                                    'Hygieneartikel (Zahnbürste, Zahnpasta, ggf. Damenhygieneartikel, Kernseife)',
                                    'Schnelltrocknendes Trekking-/Outdoorhandtuch',
                                    'Feuchttücher & Toilettenpapier',
                                    'Mund-Nasen-Bedeckung',
                                    'Jod- oder Kohletabletten'
                                ],
                                tools: [
                                    'Taschenmesser und/oder Multitool',
                                    'Outdoor-Messer (z.b. Esse 4 / Esse 6)'
                                ],
                                otherEquipment: [
                                    'Regenhülle oder Packliner zum Schutz der Ausrüstung',
                                    'Taschen- und/oder Stirnlampe',
                                    'Notfallradio (Kurbel- oder batteriebetrieben)',
                                    'Powerbank und Ladekabel',
                                    'Knicklichter',
                                    'Stift/Zettel',
                                    'Klebeband (bevorzugt Panzertape/Gewebeband)',
                                    'ggf. Atemschutzmaske',
                                    'Ersatzbatterien',
                                    'Walkie-Talkie',
                                    'Bargeld',
                                    'Wichtige Dokumente'
                                ]
                            }
                        },
                        tips: {
                            b1: 'Regelmäßig überprüfen, ob alles einsatzbereit ist',
                            b2: 'Gewicht auf das Nötigste reduzieren',
                            b3: 'Dokumentenmappe griffbereit aufbewahren',
                            b4: 'Wichtige Medikamente & Tierbedarf nicht vergessen'
                        },
                        storagePlace: {
                            p1: 'Der Notfallrucksack sollte an einem gut zugänglichen Ort aufbewahrt werden – idealerweise in der Nähe des Wohnbereichs. Achte darauf, dass der Lagerplatz trocken, vor Feuchtigkeit geschützt und im Notfall schnell erreichbar ist.'
                        },
                        readyKitsAvailable: {
                            p1: 'Ja, es gibt zahlreiche Anbieter, die fertige Notfallrucksäcke oder individuell zusammenstellbare Sets anbieten. Diese Lösungen sind häufig bereits optimal auf verschiedene Krisenszenarien abgestimmt und können eine gute Alternative darstellen, wenn Du nicht selbst alle Komponenten zusammenstellen möchtest.'
                        }
                    },
                    sicherheit: {
                        why: {
                            p1: 'Ein sicheres Zuhause bietet nicht nur Schutz vor Einbrüchen, sondern auch vor den Folgen von Naturkatastrophen wie Unwetter, Bränden oder Überschwemmungen. Durch geeignete Maßnahmen können Schäden reduziert und eine schnelle Evakuierung im Notfall gewährleistet werden.'
                        },
                        measures: {
                            intro: 'Als Eigentümer oder Mieter sollten Sie sich darüber informieren, welche Maßnahmen bereits getroffen wurden und welche Sie selbst veranlassen können. Hier einige Beispiele:',
                            roof: {
                                title: 'Das Dach',
                                items: {
                                    b1: 'Sichern Sie die Dachdeckung mit Sturmhaken und ausreichender Vernagelung.',
                                    b2: 'Beugen Sie Dachlawinen durch den Einbau von Schneefanggittern vor – besonders bei Flachdächern und weit gespannten Decken.',
                                    b3: 'Sichern Sie den Dachstuhl und die Dachhaut durch zusätzliche Befestigungen, um ein Abheben bei Orkanböen zu verhindern.',
                                    b4: 'Bei geneigten Dächern kann der Einsatz von Windrispen in kreuzweiser Anordnung sinnvoll sein.'
                                }
                            },
                            garden: {
                                title: 'Der Garten und die Außenanlage',
                                items: {
                                    b1: 'Überprüfen Sie Bäume in Hausnähe – umsturzgefährdete Bäume oder herunterfallende Äste können erheblichen Schaden anrichten.',
                                    b2: 'Sichern Sie Markisen, Überdachungen und andere bewegliche Gegenstände (z.b. Gartenmöbel, Sonnenschirme, Fahrräder) gegen Stürme.'
                                }
                            },
                            wastewater: {
                                title: 'Das Abwasser',
                                items: {
                                    b1: 'Installieren Sie Rückstauverschlüsse bzw. -klappen in Abwasserleitungen und kontrollieren Sie deren Funktion regelmäßig.',
                                    b2: 'Setzen Sie Hebeanlagen ein, um Abwasser aus tiefer gelegenen Geschossen sicher zu entsorgen, und planen Sie Pumpensümpfe in überflutungsgefährdeten Bereichen ein.',
                                    b3: 'Wasserfeste Fliesenbeläge und Dämmmaterialien in Untergeschossen unterstützen eine effektive Entsorgung von Wasser und Schlamm.'
                                }
                            },
                            electrical: {
                                title: 'Die Elektroversorgung',
                                items: {
                                    b1: 'Lassen Sie Ihre Elektroanlage hinsichtlich Überspannungsschutz und Fehlerstrom-Schutzeinrichtungen (RCD/FI) überprüfen.',
                                    b2: 'Stellen Sie sicher, dass der Blitzschutz ausreichend ausgelegt ist – in gefährdeten Geschossen können separate Stromkreise sinnvoll sein.',
                                    b3: 'Sichern Sie Zählerkästen und den Hausanschluss gegen Überschwemmungen und überlegen Sie den Einsatz eines kleinen Notstromaggregats für kritische Geräte.'
                                }
                            },
                            heating: {
                                title: 'Die Heizung',
                                items: {
                                    b1: 'Sichern Sie Tankanlagen und Heizungsanlagen im und außerhalb des Hauses gegen Aufschwimmen.',
                                    b2: 'Planen Sie die Möglichkeit ein, die Heizungsanlage im Notfall über Notstrom zu betreiben.'
                                }
                            }
                        },
                        alert: {
                            title: 'Wohnlage und Risikobewertung',
                            descPre: 'Informieren Sie sich, ob Ihre Wohnlage hochwasser- oder starkregengefährdet ist – etwa über die Hochwassergefahren- und Risikokarten der Bundesländer (z.b. unter\u00A0',
                            linkLabel: 'geoportal.bafg.de',
                            descPost: '). Diese Karten helfen Ihnen, das Risiko einzuschätzen und entsprechende Vorsorgemaßnahmen zu treffen.'
                        },
                        tips: {
                            b1: 'Führen Sie regelmäßige Wartungen an elektrischen Anlagen und Sicherheitsvorrichtungen durch.',
                            b2: 'Überprüfen Sie bauliche Maßnahmen wie Dachbefestigungen, Rückstauklappen und Notstromaggregate.',
                            b3: 'Üben Sie Evakuierungswege mit allen Familienmitgliedern und erstellen Sie einen Notfallplan.',
                            b4: 'Installieren Sie Sicherheitsausrüstung an strategischen Stellen und kontrollieren Sie diese regelmäßig.'
                        }
                    },
                    beduerfnisse: {
                        intro: {
                            p1: 'Nicht jeder Mensch hat die gleichen Bedürfnisse im Notfall. Kinder, ältere Menschen, Menschen mit Behinderungen und auch Haustiere benötigen oft spezielle Vorkehrungen. Passe deinen Notfallplan individuell an, um alle optimal zu versorgen.'
                        },
                        tips: {
                            title: 'Tipps & Tricks:',
                            b1: 'Stelle spezielle Nahrung und Medikamente für betroffene Personen bereit.',
                            b2: 'Ergänze den Vorrat mit zusätzlichen Hygieneartikeln und Hilfsmitteln.',
                            b3: 'Erarbeite einen individuellen Evakuierungsplan für Kinder und Senioren.',
                            b4: 'Denke auch an tiergerechte Notfallpakete für Haustiere.'
                        },
                        outro: {
                            p1: 'Eine umfassende Planung, die alle individuellen Anforderungen berücksichtigt, stellt sicher, dass niemand im Notfall zu kurz kommt.'
                        }
                    }
                },
                sicherheit: {
                    why: {
                        p1: 'Ein sicheres Zuhause bietet nicht nur Schutz vor Einbrüchen, sondern auch vor den Folgen von Naturkatastrophen wie Unwetter, Bränden oder Überschwemmungen. Durch geeignete Maßnahmen können Schäden reduziert und eine schnelle Evakuierung im Notfall gewährleistet werden.'
                    },
                    measures: {
                        intro: 'Als Eigentümer oder Mieter sollten Sie sich darüber informieren, welche Maßnahmen bereits getroffen wurden und welche Sie selbst veranlassen können. Hier einige Beispiele:',
                        roof: {
                            title: 'Das Dach',
                            items: {
                                b1: 'Sichern Sie die Dachdeckung mit Sturmhaken und ausreichender Vernagelung.',
                                b2: 'Beugen Sie Dachlawinen durch den Einbau von Schneefanggittern vor – besonders bei Flachdächern und weit gespannten Decken.',
                                b3: 'Sichern Sie den Dachstuhl und die Dachhaut durch zusätzliche Befestigungen, um ein Abheben bei Orkanböen zu verhindern.',
                                b4: 'Bei geneigten Dächern kann der Einsatz von Windrispen in kreuzweiser Anordnung sinnvoll sein.'
                            }
                        },
                        garden: {
                            title: 'Der Garten und die Außenanlage',
                            items: {
                                b1: 'Überprüfen Sie Bäume in Hausnähe – umsturzgefährdete Bäume oder herunterfallende Äste können erheblichen Schaden anrichten.',
                                b2: 'Sichern Sie Markisen, Überdachungen und andere bewegliche Gegenstände (z.b. Gartenmöbel, Sonnenschirme, Fahrräder) gegen Stürme.'
                            }
                        },
                        wastewater: {
                            title: 'Das Abwasser',
                            items: {
                                b1: 'Installieren Sie Rückstauverschlüsse bzw. -klappen in Abwasserleitungen und kontrollieren Sie deren Funktion regelmäßig.',
                                b2: 'Setzen Sie Hebeanlagen ein, um Abwasser aus tiefer gelegenen Geschossen sicher zu entsorgen, und planen Sie Pumpensümpfe in überflutungsgefährdeten Bereichen ein.',
                                b3: 'Wasserfeste Fliesenbeläge und Dämmmaterialien in Untergeschossen unterstützen eine effektive Entsorgung von Wasser und Schlamm.'
                            }
                        },
                        electrical: {
                            title: 'Die Elektroversorgung',
                            items: {
                                b1: 'Lassen Sie Ihre Elektroanlage hinsichtlich Überspannungsschutz und Fehlerstrom-Schutzeinrichtungen (RCD/FI) überprüfen.',
                                b2: 'Stellen Sie sicher, dass der Blitzschutz ausreichend ausgelegt ist – in gefährdeten Geschossen können separate Stromkreise sinnvoll sein.',
                                b3: 'Sichern Sie Zählerkästen und den Hausanschluss gegen Überschwemmungen und überlegen Sie den Einsatz eines kleinen Notstromaggregats für kritische Geräte.'
                            }
                        },
                        heating: {
                            title: 'Die Heizung',
                            items: {
                                b1: 'Sichern Sie Tankanlagen und Heizungsanlagen im und außerhalb des Hauses gegen Aufschwimmen.',
                                b2: 'Planen Sie die Möglichkeit ein, die Heizungsanlage im Notfall über Notstrom zu betreiben.'
                            }
                        }
                    },
                    alert: {
                        title: 'Wohnlage und Risikobewertung',
                        descPre: 'Informieren Sie sich, ob Ihre Wohnlage hochwasser- oder starkregengefährdet ist – etwa über die Hochwassergefahren- und Risikokarten der Bundesländer (z.b. unter\u00A0',
                        linkLabel: 'geoportal.bafg.de',
                        descPost: '). Diese Karten helfen Ihnen, das Risiko einzuschätzen und entsprechende Vorsorgemaßnahmen zu treffen.'
                    },
                    tips: {
                        b1: 'Führen Sie regelmäßige Wartungen an elektrischen Anlagen und Sicherheitsvorrichtungen durch.',
                        b2: 'Überprüfen Sie bauliche Maßnahmen wie Dachbefestigungen, Rückstauklappen und Notstromaggregate.',
                        b3: 'Üben Sie Evakuierungswege mit allen Familienmitgliedern und erstellen Sie einen Notfallplan.',
                        b4: 'Installieren Sie Sicherheitsausrüstung an strategischen Stellen und kontrollieren Sie diese regelmäßig.'
                    }
                },
                beduerfnisse: {
                    intro: {
                        p1: 'Nicht jeder Mensch hat die gleichen Bedürfnisse im Notfall. Kinder, ältere Menschen, Menschen mit Behinderungen und auch Haustiere benötigen oft spezielle Vorkehrungen. Passe deinen Notfallplan individuell an, um alle optimal zu versorgen.'
                    },
                    tips: {
                        title: 'Tipps & Tricks:',
                        b1: 'Stelle spezielle Nahrung und Medikamente für betroffene Personen bereit.',
                        b2: 'Ergänze den Vorrat mit zusätzlichen Hygieneartikeln und Hilfsmitteln.',
                        b3: 'Erarbeite einen individuellen Evakuierungsplan für Kinder und Senioren.',
                        b4: 'Denke auch an tiergerechte Notfallpakete für Haustiere.'
                    },
                    outro: {
                        p1: 'Eine umfassende Planung, die alle individuellen Anforderungen berücksichtigt, stellt sicher, dass niemand im Notfall zu kurz kommt.'
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
            home: {
                title: 'Empfehlungen der Bundesregierung zur Lagerhaltung',
                intro: 'Im Rahmen der Notfallvorsorge rät die Bundesregierung, einen umfassenden Vorrat an lebenswichtigen Gütern anzulegen.',
                moreInfo: 'Mehr erfahren',
                info: {
                    title: 'Weitere Informationen',
                    guide: {
                        pre: 'Laden Sie den ',
                        link: 'Ratgeber Notfallvorsorge',
                        post: ' herunter, um detaillierte Hinweise und weiterführende Informationen zu erhalten.'
                    },
                    checklist: {
                        pre: 'Die ',
                        link: 'Checkliste Notfallvorsorge',
                        post: ' wird zukünftig durch eine interaktive Komponente ersetzt, die automatisch Ihren Lagerbestand überprüft und die Liste abhakt.'
                    },
                    bbk: {
                        pre: 'Weitere Informationen und konkrete Handlungsempfehlungen finden Sie auch auf der offiziellen Seite des BBK: ',
                        link: 'BBK - Vorsorge im Krisenfall'
                    }
                },
                notice: {
                    title: 'Hinweis',
                    desc: 'Diese Empfehlungen dienen als Orientierung und sollten an Ihre individuellen Bedürfnisse angepasst werden. Prüfen Sie regelmäßig Ihren Vorrat und aktualisieren Sie diesen bei Bedarf.'
                },
                recommendations: {
                    lebensmittel: {
                        title: 'Lebensmittelvorrat',
                        description: 'Die Bundesregierung empfiehlt, einen Vorrat an lang haltbaren Lebensmitteln für mindestens 10 Tage anzulegen. Dies umfasst Konserven, Trockenprodukte, Reis, Nudeln sowie zusätzliche Artikel für spezielle Ernährungsbedürfnisse. Achten Sie darauf, dass der Vorrat abwechslungsreich und ausgewogen ist.'
                    },
                    wasser: {
                        title: 'Trinkwasser',
                        description: 'Pro Person sollten mindestens 2 Liter Trinkwasser pro Tag für 10 Tage bereitgestellt werden. Dabei ist es wichtig, das Wasser in geeigneten Behältnissen hygienisch zu lagern. Überprüfen Sie regelmäßig das Haltbarkeitsdatum und den Zustand der Lagerbehälter.'
                    },
                    medikamente: {
                        title: 'Medikamente & Erste-Hilfe-Material',
                        description: 'Ein gut ausgestatteter Erste-Hilfe-Kasten sowie ein Vorrat an wichtigen Medikamenten sind unverzichtbar. Neben Standardmaterialien sollten Sie auch persönliche Medikamente (z. B. für chronische Erkrankungen) und eventuell spezielle Hilfsmittel bereithalten.'
                    },
                    hygiene: {
                        title: 'Hygieneartikel & Desinfektionsmittel',
                        description: 'Um Infektionen vorzubeugen, sollten Sie einen Vorrat an Seife, Desinfektionsmitteln, Hygienetüchern und weiteren Pflegeartikeln anlegen. Diese Artikel sind nicht nur im medizinischen Notfall wichtig, sondern auch für den alltäglichen Schutz in Krisenzeiten.'
                    },
                    informieren: {
                        title: 'Notfallausrüstung & Kommunikation',
                        description: 'Neben dem Grundbedarf sollten auch Geräte wie ein Kurbel oder Batteriebetriebenes Radio, Taschenlampen, Ersatzbatterien, Powerbanks und ein Notfallkit für wichtige Dokumente und Bargeld vorhanden sein. Diese Ausrüstung unterstützt Sie dabei, auch im Krisenfall informiert und handlungsfähig zu bleiben.'
                    },
                    beduerfnisse: {
                        title: 'Spezielle Bedürfnisse',
                        description: 'Planen Sie zusätzlich für Kinder, ältere Menschen oder Haustiere. Dies umfasst beispielsweise Babynahrung, altersgerechte Medikamente oder Tierfutter. Berücksichtigen Sie dabei auch eventuelle besondere Ernährungsbedürfnisse.'
                    },
                    dokumente: {
                        title: 'Wichtige Dokumente sichern',
                        description: 'Sorgen Sie dafür, dass alle wichtigen Dokumente wie Personalausweis, Reisepass, Versicherungsunterlagen und Bankinformationen an einem sicheren Ort aufbewahrt werden – idealerweise in einem feuerfesten Safe oder digital gesichert.'
                    },
                    gepaeck: {
                        title: 'Notgepäck',
                        description: 'Ein Notgepäck sollte schnell griffbereit sein und alle essentiellen Dinge enthalten, wie Bargeld, wichtige Dokumente, ein Mobiltelefon samt Ladegerät, ein Erste-Hilfe-Set, Wasser, Snacks und Wechselkleidung. Packen Sie es so, dass Sie im Notfall zügig das Haus verlassen können.'
                    },
                    sicherheit: {
                        title: 'Sicherheit im Haus',
                        description: 'Überprüfen Sie, ob Ihr Zuhause im Krisenfall sicher ist. Dazu gehören funktionierende Alarmanlagen, stabile Sicherheitsschlösser, frei zugängliche Notausgänge und ein klar definierter Evakuierungsplan. Achten Sie auch darauf, dass potenzielle Gefahrenquellen minimiert werden.'
                    }
                }
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
                titles: {
                    login: 'Login',
                    register: 'Registrieren',
                    forgotPassword: 'Passwort zurücksetzen'
                },
                buttons: {
                    login: 'Login',
                    register: 'Registrieren',
                    registerNow: 'Jetzt registrieren',
                    loginHere: 'Hier einloggen',
                    forgotPassword: 'Passwort vergessen?',
                    requestNewPassword: 'Neues Passwort anfordern'
                },
                cta: {
                    noAccount: 'Noch kein Konto?',
                    haveAccount: 'Schon ein Konto?',
                    backTo: 'Zurück zum'
                },
                validation: {
                    passwordRequired: 'Bitte Passwort eingeben!'
                },
                messages: {
                    registerInvite: 'Registrierung erfolgreich. Bitte aktivieren Sie Ihren Account über den in der E-Mail enthaltenen Link. Bei erneuter Anmeldung werden Sie automatisch der Gruppe hinzugefügt.',
                    registerDefault: 'Registrierung erfolgreich. Bitte aktivieren Sie Ihren Account über den in der E-Mail enthaltenen Link, bevor Sie sich einloggen.',
                    forgotSent: 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.',
                    unexpected: 'Ein unerwarteter Fehler ist aufgetreten.'
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
                homeInfo: {
                    toc: 'Inhaltsverzeichnis',
                    back: 'Zur Übersicht'
                },
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
                password: 'Password',
                filter: 'Filter',
                filter_with_count: 'Filter ({{count}})',
                filter_open: 'Open filter',
                filter_open_active: 'Open filter — {{count}} active',
            },
            search: {
                placeholder: 'Search for items, checklist, categories or pages...',
                no_results: 'No results found',
                labels: {
                    storageStock: 'In stock',
                    cart: 'Shopping cart',
                    emergency: 'Emergency preparedness',
                    page: 'Page',
                    checklist: 'Checklist'
                },
                pages: {
                    storage: 'Storage',
                    checklist: 'Checklist',
                    basket: 'Shopping list',
                    addItem: 'Add new item'
                }
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
            emergency: {
                toc: 'Table of contents',
                titles: {
                    lebensmittel: 'Food stockpile',
                    wasser: 'Drinking water stockpile',
                    medikamente: 'Medication & first aid',
                    dokumente: 'Important documents',
                    hygiene: 'Hygiene & disinfection',
                    informieren: 'Emergency gear & communication',
                    gepaeck: 'Emergency bag & bug-out bag',
                    sicherheit: 'Home safety',
                    beduerfnisse: 'Special needs'
                },
                sections: {
                    why: 'Why stockpile?',
                    storageType: 'Which stockpiling type are you?',
                    tips: 'Tips for assembling a stockpile',
                    storageAndTreatment: 'Storage & treatment',
                    waterTips: 'Tips for drinking water stockpiles',
                    wellPrepared: 'How to be well prepared',
                    storageHints: 'Storage hints',
                    homePharmacyContents: 'What belongs in a home pharmacy',
                    upToDate: 'Always up to date',
                    allInOnePlace: 'Everything important in one place',
                    documentFolderContents: 'What belongs in the document folder',
                    updateAndSecure: 'Tips for updating & securing',
                    hygienePrepare: 'Prepare for emergencies',
                    hygieneActions: 'What you can do',
                    hygieneStock: 'What you should have in stock',
                    whyEquipment: 'Why emergency equipment?',
                    emergencyDevices: 'Emergency devices',
                    communication: 'Means of communication',
                    radioFrequencies: 'Radio frequencies',
                    tipsTricks: 'Tips and tricks',
                    whyBackpack: 'Why a bug-out bag?',
                    whenBackpack: 'When do you need a bug-out bag?',
                    backpackChoice: 'Choosing the right backpack',
                    backpackContents: 'What belongs in the bug-out bag?',
                    backpackSystem: 'Bug-out bag system',
                    packingLists: 'Packing lists',
                    prepTips: 'Preparation tips',
                    storagePlace: 'Where to store the bug-out bag?',
                    readyKitsAvailable: 'Are ready-made emergency kits available?',
                    safetyWhyHome: 'Why home safety?',
                    safetyMeasures: 'Structural & technical measures',
                    safetyMaintenanceEvac: 'Maintenance & evacuation planning tips'
                },
                content: {
                    lebensmittel: {
                        why: {
                            intro: 'A stock of food and beverages can be helpful in many situations:',
                            b1: 'When you cannot leave the house to shop because floods or heavy snowfall make supermarkets inaccessible.',
                            b2: 'When you should rest in bed due to an acute illness.',
                            b3: 'When a severe storm is raging and you could be injured outdoors.',
                            b4: 'When access to food or drinking water is limited — e.g., during widespread power outages or supply shortages caused by pandemics, cyberattacks, or drought.',
                            outro: 'With our tips, we want to help you create a stockpile that fits your needs.'
                        },
                        storageType: {
                            intro: 'There are different approaches to building a food and beverage stockpile:',
                            once: {
                                title: 'One-time stockpile:',
                                i1: 'Buy: Create a larger stockpile for 10 days in one go.',
                                i2: 'Check: Regularly check shelf life, e.g., once a year, and use items that are about to expire first.',
                                i3: 'Renew: Replace expired or consumed items promptly.'
                            },
                            live: {
                                title: 'Rotating stockpile:',
                                i1: 'Buy: Take a little extra with each purchase to gradually build a stockpile.',
                                i2: 'Consume: Use items regularly and replenish continuously.',
                                i3: 'Renew: Rebuy consumed items in your next shopping trips so your stockpile stays current.'
                            }
                        },
                        tips: {
                            intro: 'A stockpile is very individual — here are some general recommendations:',
                            b1: 'How much food? We recommend a stockpile for 10 days. If you want to be even safer, you can extend it up to 10 days.',
                            b2: 'How much water? An adult needs at least 1.5 liters per day plus approx. 0.5 liters for cooking.',
                            b3: 'What food? Base it on your daily consumption — whether simple essentials or a varied diet.',
                            b4: 'Shelf life: Prefer foods that are long-lasting without refrigeration.',
                            b5: 'Ready-to-eat: Products that don’t need cooking are ideal if the stove and cooking options fail.',
                            b6: 'Short cooking time: Foods that require little energy to prepare conserve resources.',
                            b7: 'Special needs: Consider allergies, dietary habits, or supplies for children and pets.',
                            outro: 'Suitable foods include rice, pasta, dried fruits, canned goods, nuts, zwieback, and muesli bars.'
                        }
                    },
                    wasser: {
                        why: {
                            p1: 'Water is essential — an adult can only survive a few days without fluids. In natural disasters, power outages, or other crises, public water supplies can quickly fail.',
                            p2: 'Therefore, it is essential to build an adequate drinking water stockpile to remain self-sufficient in an emergency.'
                        },
                        storageAndTreatment: {
                            p1: 'Store water in food-grade canisters or bottles and regularly check the condition of the containers. Keep them in a cool, dark place to ensure longer shelf life.',
                            p2: 'In case of contamination, water filters and purification tablets can help restore quality.'
                        },
                        tips: {
                            b1: 'Plan at least 2 liters per person per day.',
                            b2: 'Consider an extra buffer in case the outage lasts longer.',
                            b3: 'Regularly test your water treatment methods and devices.',
                            b4: 'Use alternative sources such as rainwater — only if proper treatment is possible.'
                        }
                    },
                    medikamente: {
                        wellPrepared: {
                            p1: 'Plan ahead and think carefully when assembling your home pharmacy. It is especially important when you should not leave your home in an emergency — for example, during severe storms. In such cases, having some medication and bandages in stock helps treat injuries or minor illnesses.',
                            p2: 'Replenish your supplies in time before they run out, and ensure a sensible mix of standard and personal medications.'
                        },
                        storageHints: {
                            p1: 'Store your home pharmacy in a lockable cabinet or compartment. Ensure it is out of children’s reach — ideally in a high or lockable compartment with a separate bandage area.',
                            p2: 'Choose a cool, dry room — the bathroom is unsuitable due to humidity.'
                        },
                        homePharmacyContents: {
                            intro: 'Recommended items include:',
                            b1: 'Personal, doctor-prescribed medications',
                            b2: 'Pain and fever reducers',
                            b3: 'Cold remedies',
                            b4: 'Remedies for diarrhea, nausea, vomiting',
                            b5: 'Remedies for insect bites and sunburn',
                            b6: 'Electrolytes to compensate for diarrheal diseases',
                            b7: 'Thermometer',
                            b8: 'Splinter tweezers',
                            b9: 'Skin disinfectant',
                            b10: 'Wound disinfectant',
                            b11: 'Disposable gloves',
                            b12: 'Face mask',
                            b13: 'Bandages (e.g., gauze compress, bandage scissors, plasters, bandages, triangular scarf)'
                        },
                        upToDate: {
                            p1: 'Ensure your home pharmacy does not contain expired medication! Many households keep expired medications, which can be dangerous as their effectiveness may be lost or even harmful.',
                            p2: 'Check your home pharmacy regularly, discard expired products, and promptly replenish consumed items. Dispose of expired medication in household waste.'
                        }
                    },
                    dokumente: {
                        allInOnePlace: {
                            p1: 'Replacing important documents can be difficult — sometimes impossible. Employment references and other qualification records often have shorter retention periods than diplomas.',
                            p2: 'Think in time about what is essential for you. Compile all important documents in a folder and keep it readily accessible in one place. In an emergency, all family members should know where it is. It also makes sense to back up copies digitally or store them elsewhere — for example with relatives, friends, a notary, or in a safe deposit box.'
                        },
                        documentFolderContents: {
                            intro: 'A document folder is very individual — it depends on your personal circumstances which documents are important. Some examples:',
                            titles: {
                                original: 'Originals:',
                                originalOrCertified: 'Originals or certified copies:',
                                copies: 'Simple copies:'
                            },
                            original: {
                                b1: 'Family certificates (birth, marriage, death certificates) or the family register'
                            },
                            originalOrCertified: {
                                b1: 'Savings books, account contracts, shares, securities, insurance policies',
                                b2: 'Pension and income statements, income tax notices',
                                b3: 'Qualification records: certificates (school, university, additional qualifications)',
                                b4: 'Contracts and amendments (e.g., rental contracts, leasing contracts)',
                                b5: 'Will, living will, and power of attorney'
                            },
                            copies: {
                                b1: 'ID card, passport',
                                b2: 'Driver’s license and vehicle documents',
                                b3: 'Vaccination card',
                                b4: 'Land register excerpts',
                                b5: 'Change notices for received benefits',
                                b6: 'Payment receipts for insurance premiums (especially pension insurance)',
                                b7: 'Proof of registration with employment agencies, notices from the employment agency',
                                b8: 'Invoices that prove outstanding payment claims',
                                b9: 'Membership or contribution books from associations or other organizations'
                            }
                        },
                        updateAndSecure: {
                            b1: 'Create duplicates and digital copies of your most important documents.',
                            b2: 'Store your documents in a waterproof and fireproof folder or safe.',
                            b3: 'Inform all family members about the storage location.',
                            b4: 'Regularly check the completeness and up-to-dateness of your documents.'
                        }
                    },
                    hygiene: {
                        prepare: {
                            p1: 'In disasters or prolonged emergencies — such as a large-scale power outage — tap water may become unavailable. To bridge the time until government aid arrives, targeted precautions can ensure sufficient hygiene even then.'
                        },
                        actions: {
                            intro: 'If a prolonged water supply outage is emerging — for example due to construction work or a power outage where some water remains in the pipes — you should consider the following:',
                            b1: 'Collect water in all available larger containers (bathtub, sinks, buckets, pots, canisters) and use it as utility water, including for flushing toilets.',
                            b2: 'Use water sparingly: In prolonged scarcity, use disposable tableware and cutlery to save water for washing.',
                            b3: 'Use alternative cleaning agents that require little or no water — e.g., dry shampoo or special hand-wash pastes.',
                            b4: 'Use wet wipes and disinfectant wipes for hand cleaning.',
                            b5: 'Use household paper or damp cleaning cloths for cleaning.',
                            b6: 'Use household gloves to avoid direct contact with dirt.',
                            b7: 'If possible, use a camping toilet with replacement fluid.',
                            b8: 'Extend the shelf life of collected utility water by adding suitable disinfectants — ask in camping or outdoor stores.'
                        },
                        stock: {
                            intro: 'To maintain hygiene in emergencies, it is advisable to stock the following products:',
                            b1: 'Soap',
                            b2: 'Detergent',
                            b3: 'Toothpaste and toothbrush',
                            b4: 'Wet wipes',
                            b5: 'Disinfectant wipes',
                            b6: 'Other hygiene items (e.g., menstrual products, diapers)',
                            b7: 'Toilet paper',
                            b8: 'Paper towels',
                            b9: 'Garbage bags',
                            b10: 'Household gloves',
                            b11: 'Disinfectant',
                            b12: 'Camping toilet with replacement bags and fluid',
                            outro: 'You can find a hygiene checklist for emergencies in the guide to emergency preparedness and proper action in emergencies.'
                        }
                    },
                    informieren: {
                        whyEquipment: {
                            p1: 'In crisis situations, power outages and communication disruptions can severely affect everyday life. Emergency equipment ensures that you remain informed and capable of acting without regular infrastructure — whether for emergency communication or powering essential devices.'
                        },
                        emergencyDevices: {
                            intro: 'In case conventional power and communication systems fail, you should have the following devices ready:',
                            b1: 'Battery-powered radios',
                            b2: 'Crank or solar chargers',
                            b3: 'Spare batteries and power banks',
                            b4: 'Flashlights',
                            b5: 'Possibly radios for direct information exchange'
                        },
                        communication: {
                            p1: 'Even if regular networks fail, ensure you remain reachable and can exchange information:',
                            b1: 'Use an emergency phone with long battery life or a secondary device if your main device fails.',
                            b2: 'Keep important phone numbers and contact details on paper.',
                            b3: 'Stay informed about local warning systems and emergency alerts.',
                            b4: 'Use social media and messenger services (e.g., WhatsApp, Telegram, Signal, Facebook) for information exchange.',
                            b5: 'Install apps from authorities and organizations like WarnWetter, NINA, or KATWARN that inform you about storms, fires, floods, and other hazards.'
                        },
                        radioFrequencies: {
                            p1: 'In Germany, there are established radio frequencies that can be used in emergencies to call for help or receive current information.',
                            p2: 'The emergency number 112 is valid throughout Europe and reaches fire and rescue services. For the police in Germany, the emergency number is 110.',
                            p3: 'Amateur radio also plays an important role in emergency communication. Radio amateurs use frequencies in the VHF range (approx. 144 MHz) and UHF range (approx. 430 MHz) to set up independent communication networks during crises.',
                            p4: 'Local and regional radio stations, especially those of the German Weather Service (DWD) or public broadcasters, also continuously inform about emergencies and current developments.',
                            b1: 'Emergency numbers: 112 (fire & rescue), 110 (police)',
                            b2: 'Amateur radio: VHF (approx. 144 MHz), UHF (approx. 430 MHz)',
                            b3: 'Other sources: Local radio stations and emergency apps like NINA, WarnWetter, KATWARN'
                        },
                        tipsTricks: {
                            b1: 'Regularly test all devices for proper function.',
                            b2: 'Store your emergency equipment in a central and easily accessible place.',
                            b3: 'Maintain a checklist to monitor completeness and functionality of devices.'
                        }
                    },
                    gepaeck: {
                        whyBackpack: {
                            p1: 'A bug-out bag (BOB) ensures you have essential items ready to go in an emergency. Natural disasters, fires, chemical accidents, or evacuations can require leaving home at short notice.',
                            p2: 'Germany’s civil protection authority (BBK) recommends that every household keeps a packed emergency backpack to be prepared for different crisis scenarios.'
                        },
                        whenBackpack: {
                            intro: 'Whether you need a bug-out bag depends on the scenario. Possible situations include:',
                            b1: 'Evacuation due to a gas leak, chemical accident, or bomb disposal',
                            b2: 'Fleeing from natural disasters such as floods, wildfires, or storms',
                            b3: 'Power outages or supply shortages',
                            b4: 'Extreme cases: Surviving in the wild for several days or weeks'
                        },
                        backpackChoice: {
                            p1: 'The ideal emergency backpack should be robust, waterproof, and ergonomic. Models with a MOLLE system offer modular expandability — allowing customization to individual needs. Weight also plays a crucial role, since mobility is essential in an emergency.',
                            p2Intro: 'There are different types of backpacks:',
                            types: {
                                molle: { title: 'MOLLE backpacks:', desc: 'Very robust, modularly expandable, but heavy' },
                                trekking: { title: 'Trekking backpacks:', desc: 'Optimized for long distances, lighter than MOLLE backpacks' },
                                ultra: { title: 'Ultralight backpacks:', desc: 'Minimalistic, very light, but less durable' }
                            }
                        },
                        backpackContents: {
                            intro: 'In addition to basic equipment, special needs should be considered:',
                            adult: {
                                title: 'Emergency backpack for adults',
                                items: {
                                    b1: 'Documents & valuables',
                                    b2: 'Water & provisions',
                                    b3: 'Warm clothing',
                                    b4: 'Hygiene items & first-aid kit',
                                    b5: 'Emergency communication (radio, power bank, flashlight)',
                                    b6: 'Survival equipment (knife, fire starter, water filter)'
                                }
                            },
                            child: {
                                title: 'Emergency backpack for children',
                                items: {
                                    b1: 'Child-appropriate clothing and a change of clothes',
                                    b2: 'Comfort items or favorite toy',
                                    b3: 'Snacks and drinks',
                                    b4: 'Important personal documents'
                                },
                                weightWarning: 'Important: For children’s backpacks, pay attention to the packed weight.'
                            },
                            table: {
                                headings: { age: 'Age', volume: 'Backpack volume', maxWeight: 'Max. weight' },
                                rows: {
                                    r1: { age: '3 – 4', volume: '6 – 9 liters', weight: '1.5 kg' },
                                    r2: { age: '5 – 6', volume: '10 – 12 liters', weight: '2 kg' },
                                    r3: { age: '6 – 8', volume: '15 – 18 liters', weight: '3 kg' },
                                    r4: { age: '8 – 10', volume: '16 – 20 liters', weight: '5 kg' }
                                }
                            },
                            baby: {
                                title: 'Emergency backpack for babies',
                                items: {
                                    b1: 'Diapers, wet wipes, and baby food',
                                    b2: 'Bottles, spare clothing, and blankets',
                                    b3: 'Soothing items such as a pacifier',
                                    b4: 'Necessary medication and care products'
                                }
                            },
                            pet: {
                                title: 'Emergency backpack for pets',
                                items: {
                                    b1: 'Food and water for several days',
                                    b2: 'Leash, carrier, or muzzle',
                                    b3: 'Medication and veterinary documents',
                                    b4: 'Familiar items (e.g., a familiar blanket)'
                                }
                            }
                        },
                        system: {
                            intro: 'A tiered system helps adapt the bug-out bag to different scenarios:',
                            lvl1: { title: 'Level 1 — Grab-and-go kit', desc: 'Minimal gear — essential documents, cash, mobile phone, and basic hygiene items.' },
                            lvl2: { title: 'Level 2 — Bug-out bag', desc: 'Extended kit for longer evacuations — additional food, water, survival gear, and a more comprehensive first-aid kit.' },
                            lvl3: { title: 'Level 3 — INCH bag', desc: 'Most comprehensive kit for extreme emergencies — covers several days and includes advanced survival tools, extra clothing, and additional equipment.' }
                        },
                        packlists: {
                            panelHeaders: {
                                notgepaeck: 'Packing list: Grab-and-go kit',
                                bugout: 'Packing list: Bug-out bag',
                                inchBag: 'Packing list: INCH bag'
                            },
                            groups: {
                                warmClothes: 'Warm gear & clothing',
                                food: 'Provisions',
                                hygieneFirstAid: 'Hygiene & first aid',
                                otherEquipment: 'Other equipment',
                                sleepShelter: 'Sleep & shelter',
                                clothing: 'Clothing',
                                tools: 'Tools'
                            },
                            notgepaeck: {
                                warmClothes: [
                                    'Light sleeping bag or blanket',
                                    'Warm jacket & waterproof jacket',
                                    '1–2 pairs of spare socks, long base layer'
                                ],
                                food: [
                                    '2–3 liters of water',
                                    'Food for 1 to 2 days (trekking meals, emergency rations such as NRG5)',
                                    'Snacks & energy bars',
                                    'Eating and cooking utensils, optionally a camping stove and fuel',
                                    'Coffee or tea if desired'
                                ],
                                hygieneFirstAid: [
                                    'Small first-aid kit with personal medication',
                                    'Toothbrush, toothpaste, menstrual hygiene products',
                                    'Wet wipes & concentrated soap',
                                    'Light travel towel or quick-dry trekking/outdoor towel',
                                    'Toilet paper'
                                ],
                                otherEquipment: [
                                    'SOS capsule for children with address and contact details',
                                    'Rain cover for the backpack',
                                    'Pocket knife, flashlight and/or headlamp',
                                    'Power bank & chargers'
                                ]
                            },
                            bugout: {
                                sleepShelter: [
                                    '3-season sleeping bag & sleeping pad',
                                    'Tarp or lightweight tent'
                                ],
                                food: [
                                    'Water filter & water containers',
                                    'Food for 3 to 5 days (freeze-dried trekking meals or emergency rations)',
                                    'Drinking water for 1 to 5 days depending on environment',
                                    'Lightweight eating and cooking utensils',
                                    'Camping stove and fuel',
                                    'Ferro rod, storm matches, or lighters',
                                    'Coffee or tea gear (if desired)'
                                ],
                                clothing: [
                                    'Functional (long) base layer',
                                    'Headwear and gloves',
                                    '2–3 pairs of socks',
                                    'Shirt/blouse or T-shirt',
                                    'Insulating midlayer (e.g., wool, down, or insulated)',
                                    'Waterproof, sturdy shoes',
                                    'Durable outdoor pants',
                                    'Waterproof jacket & gloves'
                                ],
                                hygieneFirstAid: [
                                    'First-aid kit with personal medication',
                                    'Hygiene items such as toothbrush, toothpaste, menstrual products, and concentrated soap',
                                    'Light travel towel or quick-dry trekking/outdoor towel',
                                    'Wet wipes & toilet paper'
                                ],
                                otherEquipment: [
                                    'Rain cover or pack liner to protect gear',
                                    'Flashlight and/or headlamp',
                                    'Pocket knife and/or multitool',
                                    'Emergency radio (crank- or battery-powered)',
                                    'Power bank and charging cable (if needed)'
                                ]
                            },
                            inchBag: {
                                sleepShelter: [
                                    '4-season sleeping bag & sleeping pad',
                                    'Tarp and/or lightweight tent'
                                ],
                                food: [
                                    'Water filter & water containers',
                                    'Food for at least 7 days (freeze-dried trekking meals or emergency rations)',
                                    'Drinking water for 1 to 5 days depending on environment',
                                    'Lightweight eating and cooking utensils',
                                    'Esbit stove or bushbox and fuel',
                                    'Ferro rod, storm matches, or lighters',
                                    'Coffee or tea gear (if desired)'
                                ],
                                clothing: [
                                    'Functional (long) base layer',
                                    'Headwear and gloves',
                                    'Scarf and warm hat',
                                    '2–3 pairs of socks',
                                    'Shirt/blouse, T-shirt',
                                    'Warm sweater (e.g., wool, down, or insulated)',
                                    'Waterproof, sturdy shoes',
                                    'Durable outdoor pants',
                                    'Waterproof, windproof jacket',
                                    'Poncho'
                                ],
                                hygieneFirstAid: [
                                    'First-aid kit with personal medication',
                                    'Hygiene items (toothbrush, toothpaste, menstrual products if needed, bar soap)',
                                    'Quick-dry trekking/outdoor towel',
                                    'Wet wipes & toilet paper',
                                    'Face covering',
                                    'Iodine or charcoal tablets'
                                ],
                                tools: [
                                    'Pocket knife and/or multitool',
                                    'Outdoor knife (e.g., ESEE 4 / ESEE 6)'
                                ],
                                otherEquipment: [
                                    'Rain cover or pack liner to protect gear',
                                    'Flashlight and/or headlamp',
                                    'Emergency radio (crank- or battery-powered)',
                                    'Power bank and charging cable',
                                    'Glow sticks',
                                    'Pen/notepad',
                                    'Duct tape (preferably heavy-duty cloth tape)',
                                    'Optional respirator mask',
                                    'Spare batteries',
                                    'Walkie-talkie',
                                    'Cash',
                                    'Important documents'
                                ]
                            }
                        },
                        tips: {
                            b1: 'Regularly check that everything is ready for use',
                            b2: 'Reduce weight to the essentials',
                            b3: 'Keep the document folder easily accessible',
                            b4: 'Don’t forget important medication and pet supplies'
                        },
                        storagePlace: {
                            p1: 'Store the emergency backpack in an easily accessible place — ideally near the living area. Make sure the storage place is dry, protected from moisture, and quickly accessible in an emergency.'
                        },
                        readyKitsAvailable: {
                            p1: 'Yes, there are many providers offering ready-made emergency backpacks or customizable kits. These solutions are often optimized for various crisis scenarios and can be a good alternative if you don’t want to assemble all components yourself.'
                        }
                    },
                    sicherheit: {
                        why: {
                            p1: 'A safe home not only protects against break-ins but also against the effects of natural disasters such as storms, fires, or floods. Suitable measures can reduce damage and ensure quick evacuation in an emergency.'
                        },
                        measures: {
                            intro: 'As an owner or tenant, find out which measures have already been taken and which you can implement yourself. Here are some examples:',
                            roof: {
                                title: 'The roof',
                                items: {
                                    b1: 'Secure the roof covering with storm hooks and sufficient nailing.',
                                    b2: 'Prevent roof avalanches by installing snow guards — especially on flat roofs and wide-span ceilings.',
                                    b3: 'Secure the roof truss and roofing with additional fastenings to prevent lifting in hurricane gusts.',
                                    b4: 'For pitched roofs, using wind bracing in a crosswise arrangement can be useful.'
                                }
                            },
                            garden: {
                                title: 'Garden and outdoor area',
                                items: {
                                    b1: 'Check trees near the house — trees at risk of falling or falling branches can cause significant damage.',
                                    b2: 'Secure awnings, canopies, and other movable items (e.g., garden furniture, umbrellas, bicycles) against storms.'
                                }
                            },
                            wastewater: {
                                title: 'Wastewater',
                                items: {
                                    b1: 'Install backwater valves in sewage pipes and regularly check their function.',
                                    b2: 'Use lifting systems to safely dispose of wastewater from lower floors and plan sump pumps in flood-prone areas.',
                                    b3: 'Waterproof floor tiles and insulation materials in basements help effectively dispose of water and sludge.'
                                }
                            },
                            electrical: {
                                title: 'Electrical supply',
                                items: {
                                    b1: 'Have your electrical system checked for surge protection and residual-current devices (RCD/GFCI).',
                                    b2: 'Ensure adequate lightning protection — separate circuits can be useful on vulnerable floors.',
                                    b3: 'Secure meter cabinets and the house connection against flooding and consider a small generator for critical devices.'
                                }
                            },
                            heating: {
                                title: 'Heating',
                                items: {
                                    b1: 'Secure tanks and heating systems inside and outside the house against floating.',
                                    b2: 'Plan for the option to run the heating system on emergency power if needed.'
                                }
                            }
                        },
                        alert: {
                            title: 'Location and risk assessment',
                            descPre: 'Find out whether your location is at risk of flooding or heavy rain — for example using federal state hazard and risk maps (e.g., at\u00A0',
                            linkLabel: 'geoportal.bafg.de',
                            descPost: '). These maps help assess risk and plan appropriate precautions.'
                        },
                        tips: {
                            b1: 'Carry out regular maintenance on electrical systems and safety devices.',
                            b2: 'Check structural measures such as roof fastenings, backwater valves, and generators.',
                            b3: 'Practice evacuation routes with all family members and create an emergency plan.',
                            b4: 'Install safety equipment at strategic locations and check it regularly.'
                        }
                    },
                    beduerfnisse: {
                        intro: {
                            p1: 'Not everyone has the same needs in an emergency. Children, older adults, people with disabilities, and pets often require special arrangements. Adapt your emergency plan to provide optimal care for everyone.'
                        },
                        tips: {
                            title: 'Tips & tricks:',
                            b1: 'Prepare special food and medication for affected individuals.',
                            b2: 'Supplement supplies with additional hygiene items and aids.',
                            b3: 'Develop an individual evacuation plan for children and seniors.',
                            b4: 'Also prepare pet-appropriate emergency kits.'
                        },
                        outro: {
                            p1: 'Comprehensive planning that considers all individual requirements ensures that no one is left behind in an emergency.'
                        }
                    }
                },
                sicherheit: {
                    why: {
                        p1: 'A safe home not only protects against break-ins but also against the effects of natural disasters such as storms, fires, or floods. Suitable measures can reduce damage and ensure quick evacuation in an emergency.'
                    },
                    measures: {
                        intro: 'As an owner or tenant, find out which measures have already been taken and which you can implement yourself. Here are some examples:',
                        roof: {
                            title: 'The roof',
                            items: {
                                b1: 'Secure the roof covering with storm hooks and sufficient nailing.',
                                b2: 'Prevent roof avalanches by installing snow guards — especially on flat roofs and wide-span ceilings.',
                                b3: 'Secure the roof truss and roofing with additional fastenings to prevent lifting in hurricane gusts.',
                                b4: 'For pitched roofs, using wind bracing in a crosswise arrangement can be useful.'
                            }
                        },
                        garden: {
                            title: 'Garden and outdoor area',
                            items: {
                                b1: 'Check trees near the house — trees at risk of falling or falling branches can cause significant damage.',
                                b2: 'Secure awnings, canopies, and other movable items (e.g., garden furniture, umbrellas, bicycles) against storms.'
                            }
                        },
                        wastewater: {
                            title: 'Wastewater',
                            items: {
                                b1: 'Install backwater valves in sewage pipes and regularly check their function.',
                                b2: 'Use lifting systems to safely dispose of wastewater from lower floors and plan sump pumps in flood-prone areas.',
                                b3: 'Waterproof floor tiles and insulation materials in basements help effectively dispose of water and sludge.'
                            }
                        },
                        electrical: {
                            title: 'Electrical supply',
                            items: {
                                b1: 'Have your electrical system checked for surge protection and residual-current devices (RCD/GFCI).',
                                b2: 'Ensure adequate lightning protection — separate circuits can be useful on vulnerable floors.',
                                b3: 'Secure meter cabinets and the house connection against flooding and consider a small generator for critical devices.'
                            }
                        },
                        heating: {
                            title: 'Heating',
                            items: {
                                b1: 'Secure tanks and heating systems inside and outside the house against floating.',
                                b2: 'Plan for the option to run the heating system on emergency power if needed.'
                            }
                        }
                    },
                    alert: {
                        title: 'Location and risk assessment',
                        descPre: 'Find out whether your location is at risk of flooding or heavy rain — for example using federal state hazard and risk maps (e.g., at\u00A0',
                        linkLabel: 'geoportal.bafg.de',
                        descPost: '). These maps help assess risk and plan appropriate precautions.'
                    },
                    tips: {
                        b1: 'Carry out regular maintenance on electrical systems and safety devices.',
                        b2: 'Check structural measures such as roof fastenings, backwater valves, and generators.',
                        b3: 'Practice evacuation routes with all family members and create an emergency plan.',
                        b4: 'Install safety equipment at strategic locations and check it regularly.'
                    }
                },
                beduerfnisse: {
                    intro: {
                        p1: 'Not everyone has the same needs in an emergency. Children, older adults, people with disabilities, and pets often require special arrangements. Adapt your emergency plan to provide optimal care for everyone.'
                    },
                    tips: {
                        title: 'Tips & tricks:',
                        b1: 'Prepare special food and medication for affected individuals.',
                        b2: 'Supplement supplies with additional hygiene items and aids.',
                        b3: 'Develop an individual evacuation plan for children and seniors.',
                        b4: 'Also prepare pet-appropriate emergency kits.'
                    },
                    outro: {
                        p1: 'Comprehensive planning that considers all individual requirements ensures that no one is left behind in an emergency.'
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
            home: {
                title: 'Federal recommendations for stockpiling',
                intro: 'As part of emergency preparedness, the federal government recommends keeping a comprehensive supply of essential goods.',
                moreInfo: 'Learn more',
                info: {
                    title: 'More information',
                    guide: {
                        pre: 'Download the ',
                        link: 'Emergency preparedness guide',
                        post: ' to get detailed instructions and further information.'
                    },
                    checklist: {
                        pre: 'The ',
                        link: 'Emergency preparedness checklist',
                        post: ' will be replaced in the future by an interactive component that automatically checks your stock and ticks the list.'
                    },
                    bbk: {
                        pre: 'You can also find more information and concrete recommendations on the official BBK website: ',
                        link: 'BBK — Preparedness in a crisis'
                    }
                },
                notice: {
                    title: 'Note',
                    desc: 'These recommendations are a guideline and should be adapted to your individual needs. Check your supplies regularly and update them when necessary.'
                },
                recommendations: {
                    lebensmittel: {
                        title: 'Food stockpile',
                        description: 'The federal government recommends creating a stock of long-lasting food for at least 10 days. This includes canned goods, dry products, rice, pasta, and additional items for special dietary needs. Make sure your stock is varied and balanced.'
                    },
                    wasser: {
                        title: 'Drinking water',
                        description: 'Provide at least 2 liters of drinking water per person per day for 10 days. Store water hygienically in suitable containers and regularly check best-before dates and the condition of storage containers.'
                    },
                    medikamente: {
                        title: 'Medication & first-aid supplies',
                        description: 'A well-equipped first-aid kit and an adequate supply of important medications are essential. In addition to standard items, also keep personal medications (e.g., for chronic conditions) and any special aids.'
                    },
                    hygiene: {
                        title: 'Hygiene items & disinfectant',
                        description: 'To prevent infections, keep a stock of soap, disinfectants, wet wipes, and other care products. These items are important not only in medical emergencies but also for everyday protection during crises.'
                    },
                    informieren: {
                        title: 'Emergency gear & communication',
                        description: 'Beyond basic supplies, keep devices such as a crank- or battery-powered radio, flashlights, spare batteries, power banks, and a kit for important documents and cash. This equipment helps you stay informed and capable of acting in a crisis.'
                    },
                    beduerfnisse: {
                        title: 'Special needs',
                        description: 'Plan additionally for children, older adults, or pets. This may include baby food, age-appropriate medicines, or pet food. Also consider any special dietary requirements.'
                    },
                    dokumente: {
                        title: 'Secure important documents',
                        description: 'Ensure that all important documents, such as ID card, passport, insurance documents, and bank information, are stored safely — ideally in a fireproof safe or backed up digitally.'
                    },
                    gepaeck: {
                        title: 'Emergency bag',
                        description: 'An emergency bag should be quickly accessible and contain all essential items such as cash, important documents, a mobile phone with charger, a first-aid kit, water, snacks, and a change of clothes. Pack it so you can leave the house quickly if necessary.'
                    },
                    sicherheit: {
                        title: 'Home safety',
                        description: 'Check whether your home is safe in a crisis. This includes functioning alarm systems, secure locks, accessible emergency exits, and a clearly defined evacuation plan. Also make sure potential hazards are minimized.'
                    }
                }
            },
            auth: {
                resetSuccess: {
                    title: 'Password reset',
                    defaultMessage: 'Password has been reset successfully.',
                    toLogin: 'Go to login'
                },
                titles: {
                    login: 'Login',
                    register: 'Register',
                    forgotPassword: 'Reset password'
                },
                buttons: {
                    login: 'Login',
                    register: 'Register',
                    registerNow: 'Register now',
                    loginHere: 'Login here',
                    forgotPassword: 'Forgot password?',
                    requestNewPassword: 'Request new password'
                },
                cta: {
                    noAccount: 'No account yet?',
                    haveAccount: 'Already have an account?',
                    backTo: 'Back to'
                },
                validation: {
                    passwordRequired: 'Please enter a password!'
                },
                messages: {
                    registerInvite: 'Registration successful. Please activate your account via the link in the email. Upon next login, you will be added to the group automatically.',
                    registerDefault: 'Registration successful. Please activate your account via the link in the email before logging in.',
                    forgotSent: 'An email to reset your password has been sent.',
                    unexpected: 'An unexpected error occurred.'
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
