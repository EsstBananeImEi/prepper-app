import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button, Collapse, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import style from './NotfallDetail.module.css';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

type DetailContent = {
    title: string;
    image: string;
    content: React.ReactNode;
};

const detailsContent: Record<string, DetailContent> = {
    lebensmittel: {
        title: "Lebensmittelvorrat",
        image: "/lebensmittel.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#warum">Warum bevorraten?</a></li>
                        <li><a href="#vorratstyp">Welcher Vorratstyp sind Sie?</a></li>
                        <li><a href="#tipps">Tipps für die Zusammenstellung eines Vorrats</a></li>
                    </ul>
                </div>

                {/* Abschnitt: Warum bevorraten? */}
                <div id="warum">
                    <h4>Warum bevorraten?</h4>
                    <p>
                        Ein Vorrat an Lebensmitteln und Getränken kann in vielen Situationen hilfreich sein:
                    </p>
                    <ul>
                        <li>
                            Wenn Sie das Haus nicht zum Einkaufen verlassen können, weil Hochwasser oder starke Schneefälle Supermärkte unerreichbar machen.
                        </li>
                        <li>
                            Wenn Sie sich aufgrund einer akuten Erkrankung schonen und im Bett bleiben sollten.
                        </li>
                        <li>
                            Wenn ein schwerer Sturm oder ein Unwetter tobt und Sie im Freien verletzt werden könnten.
                        </li>
                        <li>
                            Wenn es eingeschränkte Möglichkeiten gibt, an Nahrung oder Trinkwasser zu gelangen – z. B. bei großflächigen Stromausfällen oder Lieferengpässen durch Pandemien, Cyberangriffe oder Dürre.
                        </li>
                    </ul>
                    <p>
                        Wir möchten Sie mit unseren Tipps dabei unterstützen, einen Vorrat anzulegen, der gut zu Ihrem Bedarf passt.
                    </p>
                </div>

                {/* Abschnitt: Welcher Vorratstyp sind Sie? */}
                <div id="vorratstyp">
                    <h4>Welcher Vorratstyp sind Sie?</h4>
                    <p>
                        Es gibt verschiedene Ansätze, einen Lebensmittel- und Getränkevorrat anzulegen:
                    </p>
                    <p>
                        <b>Einmaliger Vorrat:</b>
                    </p>
                    <ul>
                        <li><b>Kaufen:</b> Legen Sie einmalig einen größeren Vorrat für 10 Tage an.</li>
                        <li><b>Prüfen:</b> Kontrollieren Sie regelmäßig die Haltbarkeit, z. B. einmal jährlich, und verbrauchen Sie bald ablaufende Produkte zuerst.</li>
                        <li><b>Erneuern:</b> Ersetzen Sie abgelaufene oder verbrauchte Produkte zeitnah.</li>
                    </ul>
                    <p>
                        <b>Lebender Vorrat:</b>
                    </p>
                    <ul>
                        <li><b>Kaufen:</b> Nehmen Sie bei jedem Einkauf etwas zusätzlich mit, um allmählich einen Vorrat aufzubauen.</li>
                        <li><b>Verbrauchen:</b> Nutzen Sie den Vorrat regelmäßig und erneuern Sie ihn kontinuierlich.</li>
                        <li><b>Erneuern:</b> Kaufen Sie Verbrauchtes bei Ihren nächsten Einkäufen nach, sodass Ihr Vorrat immer aktuell bleibt.</li>
                    </ul>
                </div>

                {/* Abschnitt: Tipps für die Zusammenstellung eines Vorrats */}
                <div id="tipps">
                    <h4>Tipps für die Zusammenstellung eines Vorrats</h4>
                    <p>
                        Ein Vorrat ist sehr individuell – hier einige allgemeine Empfehlungen:
                    </p>
                    <ul>
                        <li>
                            <strong>Wie viele Lebensmittel?</strong> Wir empfehlen einen Vorrat für 10 Tage. Wer noch sicherer gehen möchte, kann den Vorrat auf bis zu 10 Tage erweitern.
                        </li>
                        <li>
                            <strong>Wie viel Flüssigkeit?</strong> Ein Erwachsener benötigt mindestens 1,5 Liter pro Tag plus ca. 0,5 Liter fürs Kochen.
                        </li>
                        <li>
                            <strong>Welches Essen?</strong> Orientieren Sie sich an Ihrem täglichen Verbrauch – ob einfache Grundversorgung oder abwechslungsreiche Kost.
                        </li>
                        <li>
                            <strong>Haltbarkeit:</strong> Bevorzugen Sie Lebensmittel, die ohne Kühlung lange haltbar sind.
                        </li>
                        <li>
                            <strong>Fertigprodukte:</strong> Produkte, die nicht gekocht werden müssen, sind ideal, wenn Herd und Kochmöglichkeiten ausfallen.
                        </li>
                        <li>
                            <strong>Kurze Kochzeit:</strong> Lebensmittel, die mit wenig Energie zubereitet werden, schonen Ressourcen.
                        </li>
                        <li>
                            <strong>Besondere Bedürfnisse:</strong> Berücksichtigen Sie Allergien, Essgewohnheiten oder Vorräte für Kinder und Haustiere.
                        </li>
                    </ul>
                    <p>
                        Geeignete Lebensmittel umfassen unter anderem Reis, Nudeln, Trockenfrüchte, Konserven, Nüsse, Zwieback und Müsliriegel.
                    </p>
                </div>
            </>
        ),
    },
    wasser: {
        title: "Trinkwasservorrat",
        image: "/wasser.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#warumWasser">Warum bevorraten?</a></li>
                        <li><a href="#lagerungWasser">Lagerung & Aufbereitung</a></li>
                        <li><a href="#tippsWasser">Tipps zur Trinkwasservorrat</a></li>
                    </ul>
                </div>

                {/* Abschnitt: Warum bevorraten? */}
                <div id="warumWasser">
                    <h4>Warum bevorraten?</h4>
                    <p>
                        Wasser ist lebenswichtig – ein Erwachsener kann nur wenige Tage ohne Flüssigkeit auskommen. Bei Naturkatastrophen, Stromausfällen oder anderen Krisensituationen kann die öffentliche Wasserversorgung schnell zusammenbrechen.
                    </p>
                    <p>
                        Daher ist es unerlässlich, einen ausreichenden Trinkwasservorrat anzulegen, um im Notfall autark zu bleiben.
                    </p>
                </div>

                {/* Abschnitt: Lagerung & Aufbereitung */}
                <div id="lagerungWasser">
                    <h4>Lagerung & Aufbereitung</h4>
                    <p>
                        Lagern Sie Wasser in lebensmittelechten Kanistern oder Flaschen und überprüfen Sie regelmäßig den Zustand der Behälter. Achten Sie darauf, dass diese an einem kühlen, dunklen Ort aufbewahrt werden, um eine längere Haltbarkeit zu gewährleisten.
                    </p>
                    <p>
                        Im Falle einer Kontamination können Wasserfilter und Aufbereitungstabletten helfen, die Qualität wiederherzustellen.
                    </p>
                </div>

                {/* Abschnitt: Tipps zur Trinkwasservorrat */}
                <div id="tippsWasser">
                    <h4>Tipps zur Trinkwasservorrat</h4>
                    <ul>
                        <li>Planen Sie mindestens 2 Liter pro Person und Tag ein.</li>
                        <li>Erwägen Sie einen zusätzlichen Puffer, falls die Versorgung länger ausfällt.</li>
                        <li>Testen Sie regelmäßig Ihre Wasseraufbereitungsmethoden und -geräte.</li>
                        <li>Nutzen Sie alternative Quellen wie Regenwasser – nur, wenn eine fachgerechte Aufbereitung möglich ist.</li>
                    </ul>
                </div>
            </>
        ),
    },
    medikamente: {
        title: "Medikamente & Erste-Hilfe",
        image: "/medikamente.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#gut-vorbereitet">So sind Sie gut vorbereitet</a></li>
                        <li><a href="#aufbewahrung">Hinweise zur richtigen Aufbewahrung</a></li>
                        <li><a href="#inhalte">Das gehört in eine Hausapotheke</a></li>
                        <li><a href="#aktuell">Immer auf dem aktuellen Stand</a></li>
                    </ul>
                </div>

                {/* Abschnitt: So sind Sie gut vorbereitet */}
                <div id="gut-vorbereitet">
                    <h4>So sind Sie gut vorbereitet</h4>
                    <p>
                        Planen Sie vorausschauend und machen Sie sich Gedanken bei der Zusammenstellung Ihrer Hausapotheke. Sie ist besonders wichtig, wenn Sie in einer Notsituation Ihr Zuhause nicht verlassen sollten – etwa bei starkem Unwetter. In solchen Fällen ist es hilfreich, einige Medikamente und Verbandsmaterialien vorrätig zu haben, um Verletzungen oder leichtere Erkrankungen behandeln zu können.
                    </p>
                    <p>
                        Füllen Sie Ihren Vorrat rechtzeitig auf, bevor er verbraucht ist, und achten Sie dabei auf eine sinnvolle Mischung aus Standard- und persönlichen Medikamenten.
                    </p>
                </div>

                {/* Abschnitt: Hinweise zur richtigen Aufbewahrung */}
                <div id="aufbewahrung">
                    <h4>Hinweise zur richtigen Aufbewahrung</h4>
                    <p>
                        Bewahren Sie Ihre Hausapotheke in einem abschließbaren Schrank oder Fach auf. Achten Sie darauf, dass sie für Kinder nicht zugänglich ist – idealerweise in einem hoch hängenden oder abschließbaren Fach mit separatem Verbandsbereich.
                    </p>
                    <p>
                        Wählen Sie einen kühlen, trockenen Raum – das Badezimmer ist aufgrund der Feuchtigkeit ungeeignet.
                    </p>
                </div>

                {/* Abschnitt: Das gehört in eine Hausapotheke */}
                <div id="inhalte">
                    <h4>Das gehört in eine Hausapotheke</h4>
                    <p>Empfohlen werden unter anderem:</p>
                    <ul>
                        <li>Persönliche, vom Arzt verschriebene Medikamente</li>
                        <li>Schmerz- und fiebersenkende Mittel</li>
                        <li>Mittel gegen Erkältungskrankheiten</li>
                        <li>Mittel gegen Durchfall, Übelkeit, Erbrechen</li>
                        <li>Mittel gegen Insektenstiche und Sonnenbrand</li>
                        <li>Elektrolyte zum Ausgleich bei Durchfallerkrankungen</li>
                        <li>Fieberthermometer</li>
                        <li>Splitterpinzette</li>
                        <li>Hautdesinfektionsmittel</li>
                        <li>Wunddesinfektionsmittel</li>
                        <li>Einweghandschuhe</li>
                        <li>Atemschutzmaske</li>
                        <li>Verbandsmaterial (z.B. Mull-Kompresse, Verbandschere, Pflaster, Binden, Dreiecktuch)</li>
                    </ul>
                </div>

                {/* Abschnitt: Immer auf dem aktuellen Stand */}
                <div id="aktuell">
                    <h4>Immer auf dem aktuellen Stand</h4>
                    <p>
                        Achten Sie darauf, dass Ihre Hausapotheke keine Medikamente enthält, deren Haltbarkeitsdatum überschritten ist! Viele Haushalte sammeln abgelaufene Medikamente, was gefährlich werden kann, da deren Wirksamkeit verloren geht oder sie sogar schädlich sein können.
                    </p>
                    <p>
                        Kontrollieren Sie Ihre Hausapotheke regelmäßig, sortieren Sie abgelaufene Produkte aus und füllen Sie verbrauchte Bestandteile zeitnah auf. Entsorgen Sie abgelaufene Medikamente im Hausmüll.
                    </p>
                </div>
            </>
        ),
    },
    dokumente: {
        title: "Wichtige Dokumente",
        image: "/dokumente.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#alles">Alles Wichtige an einem Platz</a></li>
                        <li><a href="#mappe">Das gehört in die Dokumentenmappe</a></li>
                        <li><a href="#tipps">Tipps zur Aktualisierung & Sicherung</a></li>
                    </ul>
                </div>

                {/* Abschnitt: Alles Wichtige an einem Platz */}
                <div id="alles">
                    <h4>Alles Wichtige an einem Platz</h4>
                    <p>
                        Wichtige Dokumente wiederzubeschaffen kann schwierig – in manchen Fällen sogar unmöglich sein. Arbeitszeugnisse und andere Qualifizierungsnachweise unterliegen oft kürzeren Aufbewahrungsfristen als Abschlusszeugnisse.
                    </p>
                    <p>
                        Denken Sie rechtzeitig darüber nach, was für Sie essenziell ist. Stellen Sie alle wichtigen Dokumente in einer Dokumentenmappe zusammen und bewahren Sie diese an einem Ort griffbereit auf. Für den Notfall sollten alle Familienmitglieder den Standort der Mappe kennen. Zudem ist es sinnvoll, Kopien wichtiger Dokumente digital zu sichern oder an einem alternativen Ort zu hinterlegen – beispielsweise bei Verwandten, Freunden, einem Notar oder in einem Bankschließfach.
                    </p>
                </div>

                {/* Abschnitt: Das gehört in die Dokumentenmappe */}
                <div id="mappe">
                    <h4>Das gehört in die Dokumentenmappe</h4>
                    <p>
                        Eine Dokumentenmappe ist sehr individuell – es hängt von Ihren persönlichen Lebensumständen ab, welche Unterlagen für Sie wichtig sind. Hier einige Beispiele:
                    </p>
                    <p><strong>Im Original:</strong></p>
                    <ul>
                        <li>Familienurkunden (Geburts-, Heirats-, Sterbeurkunden) bzw. das Stammbuch</li>
                    </ul>
                    <p><strong>Im Original oder als beglaubigte Kopie:</strong></p>
                    <ul>
                        <li>Sparbücher, Kontoverträge, Aktien, Wertpapiere, Versicherungspolicen</li>
                        <li>Renten-, Pensions- und Einkommensbescheinigungen, Einkommenssteuerbescheide</li>
                        <li>Qualifizierungsnachweise: Zeugnisse (Schulzeugnisse, Hochschulzeugnisse, Nachweise über Zusatzqualifikationen)</li>
                        <li>Verträge und Änderungsverträge (z.B. Mietverträge, Leasingverträge)</li>
                        <li>Testament, Patientenverfügung und Vollmacht</li>
                    </ul>
                    <p><strong>Als einfache Kopie:</strong></p>
                    <ul>
                        <li>Personalausweis, Reisepass</li>
                        <li>Führerschein und Fahrzeugpapiere</li>
                        <li>Impfpass</li>
                        <li>Grundbuchauszüge</li>
                        <li>Änderungsbescheide für empfangene Leistungen</li>
                        <li>Zahlungsbelege für Versicherungsprämien (insbesondere Rentenversicherung)</li>
                        <li>Meldenachweise der Arbeitsämter, Bescheide der Agentur für Arbeit</li>
                        <li>Rechnungen, die offene Zahlungsansprüche belegen</li>
                        <li>Mitglieds- oder Beitragsbücher von Verbänden, Vereinen oder sonstigen Organisationen</li>
                    </ul>
                </div>

                {/* Abschnitt: Tipps zur Aktualisierung & Sicherung */}
                <div id="tipps">
                    <h4>Tipps zur Aktualisierung & Sicherung</h4>
                    <ul>
                        <li>Erstellen Sie Duplikate und digitale Kopien Ihrer wichtigsten Dokumente.</li>
                        <li>Lagern Sie Ihre Dokumente in einer wasserdichten und feuerfesten Mappe oder in einem Safe.</li>
                        <li>Informieren Sie alle Familienmitglieder über den Aufbewahrungsort.</li>
                        <li>Überprüfen Sie regelmäßig die Vollständigkeit und Aktualität Ihrer Unterlagen.</li>
                    </ul>
                </div>
            </>
        ),
    },
    hygiene: {
        title: "Hygiene & Desinfektion",
        image: "/hygiene.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#vorsorgen">Vorsorgen für Notsituationen</a></li>
                        <li><a href="#tun">Das können Sie tun</a></li>
                        <li><a href="#vorratHygiene">Das sollten Sie vorrätig haben</a></li>
                    </ul>
                </div>

                {/* Abschnitt: Vorsorgen für Notsituationen */}
                <div id="vorsorgen">
                    <h4>Vorsorgen für Notsituationen</h4>
                    <p>
                        Bei Katastrophen oder länger andauernden Notfällen – etwa einem großflächigen Stromausfall – kann es passieren, dass kein Leitungswasser mehr verfügbar ist. Um den Zeitraum zu überbrücken, bis staatliche Hilfe eintrifft, können Sie durch gezielte Vorsorgemaßnahmen dafür sorgen, dass auch in solchen Situationen für ausreichend Hygiene gesorgt ist.
                    </p>
                </div>

                {/* Abschnitt: Das können Sie tun */}
                <div id="tun">
                    <h4>Das können Sie tun</h4>
                    <p>
                        Wenn sich eine längere Wasserversorgungsausfall abzeichnet – beispielsweise durch Bauarbeiten oder einen Stromausfall, bei dem noch restliches Wasser in den Leitungen ist – sollten Sie folgendes beachten:
                    </p>
                    <ul>
                        <li>Sammeln Sie Wasser in allen verfügbaren größeren Gefäßen (Badewanne, Waschbecken, Eimer, Töpfe, Wasserkanister) und nutzen Sie es als Brauchwasser, auch für die Toilettenspülung.</li>
                        <li>Gehen Sie sparsam mit dem Wasser um: Verwenden Sie bei länger andauernder Knappheit Einweggeschirr und -besteck, um Wasser für das Spülen zu sparen.</li>
                        <li>Nutzen Sie alternative Reinigungsmittel, die wenig oder gar kein Wasser benötigen – zum Beispiel Trockenshampoo oder spezielle Handwaschpasten.</li>
                        <li>Verwenden Sie Feucht- und Desinfektionstücher zur Handreinigung.</li>
                        <li>Setzen Sie Haushaltspapier oder feuchte Putztücher zur Reinigung ein.</li>
                        <li>Benutzen Sie Haushaltshandschuhe, um den direkten Kontakt mit Schmutz zu vermeiden.</li>
                        <li>Setzen Sie, falls möglich, eine Campingtoilette mit Ersatzflüssigkeit ein.</li>
                        <li>Machen Sie das gesammelte Brauchwasser länger haltbar, indem Sie geeignete Entkeimungsmittel hinzufügen – lassen Sie sich hierzu im Camping- oder Outdoorhandel beraten.</li>
                    </ul>
                </div>

                {/* Abschnitt: Das sollten Sie vorrätig haben */}
                <div id="vorratHygiene">
                    <h4>Das sollten Sie vorrätig haben</h4>
                    <p>
                        Um auch in Notsituationen die Hygiene aufrechtzuerhalten, empfiehlt sich die Vorratshaltung folgender Produkte:
                    </p>
                    <ul>
                        <li>Seife</li>
                        <li>Waschmittel</li>
                        <li>Zahnpasta und Zahnbürste</li>
                        <li>Feuchttücher</li>
                        <li>Desinfektionstücher</li>
                        <li>Weitere Hygieneartikel (z.B. für Monatshygiene, Windeln)</li>
                        <li>Toilettenpapier</li>
                        <li>Haushaltspapier</li>
                        <li>Müllbeutel</li>
                        <li>Haushaltshandschuhe</li>
                        <li>Desinfektionsmittel</li>
                        <li>Campingtoilette samt Ersatzbeutel und Ersatzflüssigkeit</li>
                    </ul>
                    <p>
                        Eine Checkliste zur Hygiene in Notzeiten finden Sie im Ratgeber für Notfallvorsorge und richtiges Handeln in Notsituationen.
                    </p>
                </div>

            </>
        ),
    },
    informieren: {
        title: "Notfallausrüstung & Kommunikation",
        image: "/informieren.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#warumInfo">Warum Notfallausrüstung?</a></li>
                        <li><a href="#geraeteInfo">Notfallgeräte</a></li>
                        <li><a href="#kommunikation">Kommunikationsmittel</a></li>
                        <li><a href="#funkRadio">Funk & Radio Frequenzen</a></li>
                        <li><a href="#tippsInfo">Tipps und Tricks</a></li>
                    </ul>
                </div>

                {/* Abschnitt: Warum Notfallausrüstung? */}
                <div id="warumInfo">
                    <h4>Warum Notfallausrüstung?</h4>
                    <p>
                        In Krisensituationen können Stromausfälle und Kommunikationsstörungen den Alltag stark beeinträchtigen. Notfallausrüstung stellt sicher, dass Sie auch ohne reguläre Infrastruktur informiert und handlungsfähig bleiben – sei es zur Notfallkommunikation oder zur Stromversorgung wichtiger Geräte.
                    </p>
                </div>

                {/* Abschnitt: Notfallgeräte */}
                <div id="geraeteInfo">
                    <h4>Notfallgeräte</h4>
                    <p>
                        Für den Fall, dass herkömmliche Strom- und Kommunikationssysteme ausfallen, sollten Sie folgende Geräte bereithalten:
                    </p>
                    <ul>
                        <li>Batteriebetriebene Radios</li>
                        <li>Kurbel- oder Solarladegeräte</li>
                        <li>Ersatzbatterien und Powerbanks</li>
                        <li>Taschenlampen</li>
                        <li>Gegebenenfalls Funkgeräte für den direkten Informationsaustausch</li>
                    </ul>
                </div>

                {/* Abschnitt: Kommunikationsmittel */}
                <div id="kommunikation">
                    <h4>Kommunikationsmittel</h4>
                    <p>
                        Auch wenn die regulären Netzwerke ausfallen, sollten Sie sicherstellen, dass Sie erreichbar bleiben und Informationen austauschen können:
                    </p>
                    <ul>
                        <li>
                            Nutzen Sie ein Notfallhandy mit langer Akkulaufzeit oder ein Zweitgerät, falls Ihr Hauptgerät ausfällt.
                        </li>
                        <li>
                            Halten Sie wichtige Telefonnummern und Kontaktdaten in Papierform bereit.
                        </li>
                        <li>
                            Informieren Sie sich über lokale Warnsysteme und Notfallmeldungen.
                        </li>
                        <li>
                            Verwenden Sie soziale Medien und Messenger-Dienste (z.B. WhatsApp, Telegram, Signal, Facebook) für den Informationsaustausch.
                        </li>
                        <li>
                            Installieren Sie Apps von Behörden und Organisationen wie WarnWetter, NINA oder KATWARN, die Sie über Unwetter, Brände, Hochwasser und andere Gefahren informieren.
                        </li>
                    </ul>
                </div>

                {/* Neuer Abschnitt: Funk & Radio Frequenzen */}
                <div id="funkRadio">
                    <h4>Funk & Radio Frequenzen</h4>
                    <p>
                        In Deutschland gibt es bewährte Funk- und Radiofrequenzen, die im Notfall genutzt werden können, um Hilfe zu rufen oder aktuelle Informationen zu erhalten.
                    </p>
                    <p>
                        Der Notruf <strong>112</strong> ist europaweit gültig und erreicht Feuerwehr sowie Rettungsdienste. Für die Polizei steht in Deutschland der Notruf <strong>110</strong> zur Verfügung.
                    </p>
                    <p>
                        Zudem spielt der Amateurfunk eine wichtige Rolle in der Notfallkommunikation. Funkamateure nutzen Frequenzen im VHF-Bereich (ca. 144 MHz) und im UHF-Bereich (ca. 430 MHz), um in Krisenzeiten unabhängige Kommunikationsnetze aufzubauen.
                    </p>
                    <p>
                        Auch lokale und regionale Radiosender, insbesondere jene des Deutschen Wetterdienstes (DWD) oder öffentlich-rechtliche Rundfunkanstalten, informieren kontinuierlich über Notfälle und aktuelle Entwicklungen.
                    </p>
                    <ul>
                        <li><strong>Notrufnummern:</strong> 112 (Feuerwehr & Rettungsdienst), 110 (Polizei)</li>
                        <li><strong>Amateurfunk:</strong> VHF (ca. 144 MHz), UHF (ca. 430 MHz)</li>
                        <li><strong>Weitere Informationsquellen:</strong> Lokale Radiosender sowie Notfall-Apps wie NINA, WarnWetter, KATWARN</li>
                    </ul>
                </div>

                {/* Abschnitt: Tipps und Tricks */}
                <div id="tippsInfo">
                    <h4>Tipps und Tricks</h4>
                    <ul>
                        <li>Testen Sie regelmäßig alle Geräte auf ihre Funktionstüchtigkeit.</li>
                        <li>Bewahren Sie Ihre Notfallausrüstung an einem zentralen und gut zugänglichen Ort auf.</li>
                        <li>Führen Sie eine Checkliste, um die Vollständigkeit und Funktionsfähigkeit der Geräte zu überwachen.</li>
                    </ul>
                </div>
            </>
        ),
    },
    gepaeck: {
        title: "Notfallgepäck & Fluchtrucksack",
        image: "/gepaeck.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#warumGepaeck">Warum ein Fluchtrucksack?</a></li>
                        <li><a href="#wannGepaeck">Wann braucht man einen Fluchtrucksack?</a></li>
                        <li><a href="#rucksackwahl">Die Wahl des richtigen Rucksacks</a></li>
                        <li><a href="#inhaltGepaeck">Was gehört in den Fluchtrucksack?</a></li>
                        <li><a href="#system">Notfallrucksack System</a></li>
                        <li><a href="#packlisten">Packlisten</a></li>
                        <li><a href="#tippsGepaeck">Tipps zur Vorbereitung</a></li>
                        <li><a href="#lagerung">Wo lagere ich den Notfallrucksack?</a></li>
                        <li><a href="#fertige">Gibt es fertige Notfallrucksäcke zu kaufen?</a></li>
                    </ul>
                </div>

                {/* Statisch angezeigte Abschnitte */}
                <div id="warumGepaeck">
                    <h4>Warum ein Fluchtrucksack?</h4>
                    <p>
                        Ein Fluchtrucksack – oft auch als Bug-Out-Bag (BOB) bezeichnet – dient dazu, im Notfall schnell alles Wichtige griffbereit zu haben. Naturkatastrophen, Brände, Chemieunfälle oder Evakuierungen machen es oft notwendig, das Zuhause kurzfristig zu verlassen.
                    </p>
                    <p>
                        Das Bundesamt für Bevölkerungsschutz und Katastrophenhilfe (BBK) empfiehlt jedem Haushalt, einen gepackten Notfallrucksack bereitzuhalten, um für verschiedene Krisenszenarien vorbereitet zu sein.
                    </p>
                </div>

                <div id="wannGepaeck">
                    <h4>Wann braucht man einen Fluchtrucksack?</h4>
                    <p>Die Notwendigkeit eines Fluchtrucksacks hängt vom Szenario ab. Mögliche Situationen sind:</p>
                    <ul>
                        <li>Evakuierung wegen Gasleck, Chemieunfall oder Bombenentschärfung</li>
                        <li>Flucht aufgrund von Naturkatastrophen wie Hochwasser, Waldbränden oder Stürmen</li>
                        <li>Stromausfälle oder Versorgungsengpässe</li>
                        <li>Extremfälle: Überleben in der freien Natur für mehrere Tage oder Wochen</li>
                    </ul>
                </div>

                <div id="rucksackwahl">
                    <h4>Die Wahl des richtigen Rucksacks</h4>
                    <p>
                        Der ideale Notfallrucksack sollte robust, wasserfest und ergonomisch sein. Modelle mit einem MOLLE-System bieten den Vorteil, dass sie modular erweiterbar sind – so kann der Rucksack an individuelle Bedürfnisse angepasst werden. Auch das Gewicht spielt eine entscheidende Rolle, da im Ernstfall schnelle Mobilität gefragt ist.
                    </p>
                    <p>Es gibt verschiedene Arten von Rucksäcken:</p>
                    <ul>
                        <li><b>MOLLE-Rucksäcke:</b> Sehr robust, modular erweiterbar, aber schwer</li>
                        <li><b>Trekkingrucksäcke:</b> Optimiert für lange Strecken, leichter als MOLLE-Rucksäcke</li>
                        <li><b>Ultraleichte Rucksäcke:</b> Minimalistisch, sehr leicht, aber weniger strapazierfähig</li>
                    </ul>
                </div>

                <div id="inhaltGepaeck">
                    <h4>Was gehört in den Fluchtrucksack?</h4>
                    <p>
                        Neben der Grundausstattung sollten auch spezielle Bedürfnisse berücksichtigt werden:
                    </p>
                    <h5>Notfallrucksack für Erwachsene</h5>
                    <ul>
                        <li>Dokumente & Wertsachen</li>
                        <li>Wasser & Verpflegung</li>
                        <li>Wärmende Kleidung</li>
                        <li>Hygieneartikel & Erste-Hilfe-Set</li>
                        <li>Notfallkommunikation (Radio, Powerbank, Taschenlampe)</li>
                        <li>Survival-Equipment (Messer, Feuerstarter, Wasserfilter)</li>
                    </ul>
                    <h5>Notfallrucksack für Kinder</h5>
                    <ul>
                        <li>Kindgerechte Kleidung und Wechselkleidung</li>
                        <li>Beruhigungsmittel oder Lieblingsspielzeug</li>
                        <li>Snack- und Getränkevorrat</li>
                        <li>Wichtige persönliche Dokumente</li>
                    </ul>
                    <p><strong>Wichtig:</strong> Achten Sie bei Rucksäcken für Kinder auf das Gewicht des gepackten Rucksacks.</p>
                    <table className={style.fullWidthTable}>
                        <thead>
                            <tr>
                                <th>Alter</th>
                                <th>Rucksackvolumen</th>
                                <th>Max. Gewicht</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>3 – 4</td>
                                <td>6 – 9 Liter</td>
                                <td>1,5 kg</td>
                            </tr>
                            <tr>
                                <td>5 – 6</td>
                                <td>10 – 12 Liter</td>
                                <td>2 kg</td>
                            </tr>
                            <tr>
                                <td>6 – 8</td>
                                <td>15 – 18 Liter</td>
                                <td>3 kg</td>
                            </tr>
                            <tr>
                                <td>8 – 10</td>
                                <td>16 – 20 Liter</td>
                                <td>5 kg</td>
                            </tr>
                        </tbody>
                    </table>
                    <h5>Notfallrucksack für Babys</h5>
                    <ul>
                        <li>Windeln, Feuchttücher und Babynahrung</li>
                        <li>Fläschchen, Ersatzkleidung und Decken</li>
                        <li>Beruhigungsmittel wie Schnuller</li>
                        <li>Notwendige Medikamente und Pflegeartikel</li>
                    </ul>
                    <h5>Notfallrucksack für Haustiere</h5>
                    <ul>
                        <li>Futter und Wasser für mehrere Tage</li>
                        <li>Leine, Transportbox oder Maulkorb</li>
                        <li>Medikamente und tierärztliche Unterlagen</li>
                        <li>Bekanntes Zubehör (z. B. eine vertraute Decke)</li>
                    </ul>
                </div>

                <div id="system">
                    <h4>Notfallrucksack System</h4>
                    <p>
                        Es gibt ein abgestuftes System, um den Notfallrucksack an unterschiedliche Szenarien anzupassen:
                    </p>
                    <ul>
                        <li>
                            <b>Stufe 1 – Notgepäck:</b> Minimalistische Ausstattung – wichtige Dokumente, Bargeld, Mobiltelefon und grundlegende Hygieneartikel.
                        </li>
                        <li>
                            <b>Stufe 2 – Bug out Bag:</b> Erweiterte Version für längere Evakuierungen – zusätzlich Nahrung, Wasser, Überlebensausrüstung und ein umfangreicheres Erste-Hilfe-Set.
                        </li>
                        <li>
                            <b>Stufe 3 – INCH Bag:</b> Umfassendste Ausstattung für extreme Notfallsituationen – deckt den Bedarf für mehrere Tage ab und beinhaltet erweiterte Survival-Tools, zusätzliche Bekleidung und weiterführende Ausrüstung.
                        </li>
                    </ul>
                </div>

                {/* Packlisten in einem Collapse – hier sind die Abschnitte zusammenklappbar */}
                <div id="packlisten">
                    <h4>Packlisten</h4>
                    <Collapse accordion>
                        <Panel header="Packliste: Notgepäck" key="notgepaeck">
                            <h5>Wärmendes Equipment & Kleidung:</h5>
                            <ul>
                                <li>Leichter Schlafsack oder Decke</li>
                                <li>Wärmende Jacke & wasserdichte Jacke</li>
                                <li>1–2 Paar Wechselsocken, lange Funktionsunterwäsche</li>
                            </ul>
                            <h5>Verpflegung:</h5>
                            <ul>
                                <li>2–3 Liter Wasser</li>
                                <li>Nahrung für 1 bis 2 Tage (Trekkingnahrung, Notnahrung wie NRG5)</li>
                                <li>Snacks & Energieriegel</li>
                                <li>Ess- und Kochgeschirr, ggf. Campingkocher sowie Brennstoffvorrat</li>
                                <li>ggf. Kaffee oder Tee</li>
                            </ul>
                            <h5>Hygiene & Erste-Hilfe:</h5>
                            <ul>
                                <li>Kleines Erste-Hilfe-Set mit persönlichen Medikamenten</li>
                                <li>Zahnbürste, Zahnpasta, Damenhygieneartikel</li>
                                <li>Feuchttücher & Seifenkonzentrat</li>
                                <li>Leichtes Reisehandtuch oder schnell trocknendes Trekking-/Outdoorhandtuch</li>
                                <li>Toilettenpapier</li>
                            </ul>
                            <h5>Sonstiges Equipment:</h5>
                            <ul>
                                <li>SOS-Kapsel für Kinder mit Anschrift und Kontaktdaten</li>
                                <li>Regenhülle für den Rucksack</li>
                                <li>Taschenmesser, Taschenlampe und/oder Stirnlampe</li>
                                <li>Powerbank & Ladegeräte</li>
                            </ul>
                        </Panel>
                        <Panel header="Packliste: Bug out Bag" key="bugout">
                            <h5>Schlafen & Unterkunft:</h5>
                            <ul>
                                <li>3-Season Schlafsack & Isomatte</li>
                                <li>Tarp oder leichtes Zelt</li>
                            </ul>
                            <h5>Verpflegung:</h5>
                            <ul>
                                <li>Wasserfilter & Trinkwasserbehälter</li>
                                <li>Verpflegung für 3 bis 5 Tage (gefriergetrocknete Trekkingnahrung oder Notfallrationen)</li>
                                <li>Trinkwasser je nach Umgebung für 1 bis 5 Tage</li>
                                <li>Leichtes Ess- und Kochgeschirr</li>
                                <li>Campingkocher sowie Brennstoffvorrat</li>
                                <li>Zündstahl, Sturmstreichhölzer oder Feuerzeuge</li>
                                <li>Equipment zur Kaffee- oder Teezubereitung (bei Bedarf)</li>
                            </ul>
                            <h5>Bekleidung:</h5>
                            <ul>
                                <li>Funktionelle (lange) Unterwäsche</li>
                                <li>Kopfbedeckung und Handschuhe</li>
                                <li>2-3 Paar Socken</li>
                                <li>Hemd/Bluse oder T-Shirt</li>
                                <li>Wärmender Midlayer (z.b. Wolle, Daune oder wattiert)</li>
                                <li>Wasserfeste, robuste Schuhe</li>
                                <li>Robuste Outdoorhose</li>
                                <li>Wasserdichte Jacke & Handschuhe</li>
                            </ul>
                            <h5>Hygiene & Erste-Hilfe:</h5>
                            <ul>
                                <li>Erste-Hilfe-Set mit persönlichen Medikamenten</li>
                                <li>Hygieneartikel wie Zahnbürste, Zahnpasta, Damenhygieneartikel und Seifenkonzentrat</li>
                                <li>Leichtes Reisehandtuch oder schnell trocknendes Trekking-/Outdoorhandtuch</li>
                                <li>Feuchttücher & Toilettenpapier</li>
                            </ul>
                            <h5>Sonstiges Equipment:</h5>
                            <ul>
                                <li>Regenhülle oder Packliner zum Schutz der Ausrüstung</li>
                                <li>Taschen- und/oder Stirnlampe</li>
                                <li>Taschenmesser und/oder Multitool</li>
                                <li>Notfallradio (Kurbel- oder batteriebetrieben)</li>
                                <li>Powerbank und Ladekabel (bei Bedarf)</li>
                            </ul>
                        </Panel>
                        <Panel header="Packliste: INCH Bag" key="inchBag">
                            <h5>Schlafen & Unterkunft:</h5>
                            <ul>
                                <li>4-Season Schlafsack & Isomatte</li>
                                <li>Tarp und/oder leichtes Zelt</li>
                            </ul>
                            <h5>Verpflegung:</h5>
                            <ul>
                                <li>Wasserfilter & Trinkwasserbehälter</li>
                                <li>Verpflegung für mindestens 7 Tage (gefriergetrocknete Trekkingnahrung oder Notfallrationen)</li>
                                <li>Trinkwasser je nach Umgebung für 1 bis 5 Tage</li>
                                <li>Leichtes Ess- und Kochgeschirr</li>
                                <li>Esbitkocher bzw. Bushbox sowie Brennstoffvorrat</li>
                                <li>Zündstahl, Sturmstreichhölzer oder Feuerzeuge</li>
                                <li>Equipment zur Kaffee- oder Teezubereitung (bei Bedarf)</li>
                            </ul>
                            <h5>Bekleidung:</h5>
                            <ul>
                                <li>Funktionelle (lange) Unterwäsche</li>
                                <li>Kopfbedeckung und Handschuhe</li>
                                <li>Schal sowie warme Mütze</li>
                                <li>2-3 Paar Socken</li>
                                <li>Hemd/Bluse, T-Shirt</li>
                                <li>Wärmender Pullover (z.b. Wolle, Daune oder wattiert)</li>
                                <li>Wasserfeste, robuste Schuhe</li>
                                <li>Robuste Outdoorhose</li>
                                <li>Wasserdichte, winddichte Jacke</li>
                                <li>Poncho</li>
                            </ul>
                            <h5>Hygiene & Erste-Hilfe:</h5>
                            <ul>
                                <li>Erste-Hilfe-Set mit persönlichen Medikamenten</li>
                                <li>Hygieneartikel (Zahnbürste, Zahnpasta, ggf. Damenhygieneartikel, Kernseife)</li>
                                <li>Schnelltrocknendes Trekking-/Outdoorhandtuch</li>
                                <li>Feuchttücher & Toilettenpapier</li>
                                <li>Mund-Nasen-Bedeckung</li>
                                <li>Jod- oder Kohletabletten</li>
                            </ul>
                            <h5>Werkzeuge:</h5>
                            <ul>
                                <li>Taschenmesser und/oder Multitool</li>
                                <li>Outdoor-Messer (z.b. Esse 4 / Esse 6)</li>
                            </ul>
                            <h5>Sonstiges Equipment:</h5>
                            <ul>
                                <li>Regenhülle oder Packliner zum Schutz der Ausrüstung</li>
                                <li>Taschen- und/oder Stirnlampe</li>
                                <li>Notfallradio (Kurbel- oder batteriebetrieben)</li>
                                <li>Powerbank und Ladekabel</li>
                                <li>Knicklichter</li>
                                <li>Stift/Zettel</li>
                                <li>Klebeband (bevorzugt Panzertape/Gewebeband)</li>
                                <li>ggf. Atemschutzmaske</li>
                                <li>Ersatzbatterien</li>
                                <li>Walkie-Talkie</li>
                                <li>Bargeld</li>
                                <li>Wichtige Dokumente</li>
                            </ul>
                        </Panel>
                    </Collapse>
                </div>

                <div id="tippsGepaeck">
                    <h4>Tipps zur Vorbereitung</h4>
                    <ul>
                        <li>Regelmäßig überprüfen, ob alles einsatzbereit ist</li>
                        <li>Gewicht auf das Nötigste reduzieren</li>
                        <li>Dokumentenmappe griffbereit aufbewahren</li>
                        <li>Wichtige Medikamente & Tierbedarf nicht vergessen</li>
                    </ul>
                </div>

                <div id="lagerung">
                    <h4>Wo lagere ich den Notfallrucksack?</h4>
                    <p>
                        Der Notfallrucksack sollte an einem gut zugänglichen Ort aufbewahrt werden – idealerweise in der Nähe des Wohnbereichs. Achte darauf, dass der Lagerplatz trocken, vor Feuchtigkeit geschützt und im Notfall schnell erreichbar ist.
                    </p>
                </div>

                <div id="fertige">
                    <h4>Gibt es fertige Notfallrucksäcke zu kaufen?</h4>
                    <p>
                        Ja, es gibt zahlreiche Anbieter, die fertige Notfallrucksäcke oder individuell zusammenstellbare Sets anbieten. Diese Lösungen sind häufig bereits optimal auf verschiedene Krisenszenarien abgestimmt und können eine gute Alternative darstellen, wenn Du nicht selbst alle Komponenten zusammenstellen möchtest.
                    </p>
                </div>
            </>
        ),
    },


    sicherheit: {
        title: "Sicherheit im Haus",
        image: "/sicherheit.png",
        content: (
            <>
                {/* Inhaltsverzeichnis */}
                <div>
                    <h3>Inhaltsverzeichnis</h3>
                    <ul>
                        <li><a href="#warumSicherheit">Warum Sicherheit im Haus?</a></li>
                        <li><a href="#bauTechnik">Bauliche & technische Maßnahmen</a></li>
                        <li><a href="#tippsSicherheit">Tipps zur Wartung & Evakuierungsplanung</a></li>
                    </ul>
                </div>

                {/* Abschnitt: Warum Sicherheit im Haus? */}
                <div id="warumSicherheit">
                    <h4>Warum Sicherheit im Haus?</h4>
                    <p>
                        Ein sicheres Zuhause bietet nicht nur Schutz vor Einbrüchen, sondern auch vor den Folgen von Naturkatastrophen wie Unwetter, Bränden oder Überschwemmungen. Durch geeignete Maßnahmen können Schäden reduziert und eine schnelle Evakuierung im Notfall gewährleistet werden.
                    </p>
                </div>

                {/* Abschnitt: Bauliche & technische Maßnahmen */}
                <div id="bauTechnik">
                    <h4>Bauliche & technische Maßnahmen</h4>
                    <p>
                        Als Eigentümer oder Mieter sollten Sie sich darüber informieren, welche Maßnahmen bereits getroffen wurden und welche Sie selbst veranlassen können. Hier einige Beispiele:
                    </p>

                    <h5>Das Dach</h5>
                    <ul>
                        <li>Sichern Sie die Dachdeckung mit Sturmhaken und ausreichender Vernagelung.</li>
                        <li>Beugen Sie Dachlawinen durch den Einbau von Schneefanggittern vor – besonders bei Flachdächern und weit gespannten Decken.</li>
                        <li>Sichern Sie den Dachstuhl und die Dachhaut durch zusätzliche Befestigungen, um ein Abheben bei Orkanböen zu verhindern.</li>
                        <li>Bei geneigten Dächern kann der Einsatz von Windrispen in kreuzweiser Anordnung sinnvoll sein.</li>
                    </ul>

                    <h5>Der Garten und die Außenanlage</h5>
                    <ul>
                        <li>Überprüfen Sie Bäume in Hausnähe – umsturzgefährdete Bäume oder herunterfallende Äste können erheblichen Schaden anrichten.</li>
                        <li>Sichern Sie Markisen, Überdachungen und andere bewegliche Gegenstände (z.b. Gartenmöbel, Sonnenschirme, Fahrräder) gegen Stürme.</li>
                    </ul>

                    <h5>Das Abwasser</h5>
                    <ul>
                        <li>Installieren Sie Rückstauverschlüsse bzw. -klappen in Abwasserleitungen und kontrollieren Sie deren Funktion regelmäßig.</li>
                        <li>Setzen Sie Hebeanlagen ein, um Abwasser aus tiefer gelegenen Geschossen sicher zu entsorgen, und planen Sie Pumpensümpfe in überflutungsgefährdeten Bereichen ein.</li>
                        <li>Wasserfeste Fliesenbeläge und Dämmmaterialien in Untergeschossen unterstützen eine effektive Entsorgung von Wasser und Schlamm.</li>
                    </ul>

                    <h5>Die Elektroversorgung</h5>
                    <ul>
                        <li>Lassen Sie Ihre Elektroanlage hinsichtlich Überspannungsschutz und Fehlerstrom-Schutzeinrichtungen (RCD/FI) überprüfen.</li>
                        <li>Stellen Sie sicher, dass der Blitzschutz ausreichend ausgelegt ist – in gefährdeten Geschossen können separate Stromkreise sinnvoll sein.</li>
                        <li>Sichern Sie Zählerkästen und den Hausanschluss gegen Überschwemmungen und überlegen Sie den Einsatz eines kleinen Notstromaggregats für kritische Geräte.</li>
                    </ul>

                    <h5>Die Heizung</h5>
                    <ul>
                        <li>Sichern Sie Tankanlagen und Heizungsanlagen im und außerhalb des Hauses gegen Aufschwimmen.</li>
                        <li>Planen Sie die Möglichkeit ein, die Heizungsanlage im Notfall über Notstrom zu betreiben.</li>
                    </ul>

                    <div className={style.alert}>
                        <Alert
                            message="Wohnlage und Risikobewertung"
                            description={
                                <p>
                                    Informieren Sie sich, ob Ihre Wohnlage hochwasser- oder starkregengefährdet ist – etwa über die Hochwassergefahren- und Risikokarten der Bundesländer (z.b. unter&nbsp;
                                    <a href="https://geoportal.bafg.de" target="_blank" rel="noopener noreferrer">
                                        geoportal.bafg.de
                                    </a>
                                    ). Diese Karten helfen Ihnen, das Risiko einzuschätzen und entsprechende Vorsorgemaßnahmen zu treffen.
                                </p>
                            }
                            type="warning"
                            showIcon
                        />
                    </div>
                </div>

                {/* Abschnitt: Tipps zur Wartung & Evakuierungsplanung */}
                <div id="tippsSicherheit">
                    <h4>Tipps zur Wartung & Evakuierungsplanung</h4>
                    <ul>
                        <li>Führen Sie regelmäßige Wartungen an elektrischen Anlagen und Sicherheitsvorrichtungen durch.</li>
                        <li>Überprüfen Sie bauliche Maßnahmen wie Dachbefestigungen, Rückstauklappen und Notstromaggregate.</li>
                        <li>Üben Sie Evakuierungswege mit allen Familienmitgliedern und erstellen Sie einen Notfallplan.</li>
                        <li>Installieren Sie Sicherheitsausrüstung an strategischen Stellen und kontrollieren Sie diese regelmäßig.</li>
                    </ul>
                </div>
            </>
        ),
    },
    beduerfnisse: {
        title: "Spezielle Bedürfnisse",
        image: "/beduerfnisse.png",
        content: (
            <>
                <p>
                    Nicht jeder Mensch hat die gleichen Bedürfnisse im Notfall. Kinder, ältere Menschen, Menschen mit Behinderungen und auch Haustiere benötigen oft spezielle Vorkehrungen. Passe deinen Notfallplan individuell an, um alle optimal zu versorgen.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Stelle spezielle Nahrung und Medikamente für betroffene Personen bereit.</li>
                        <li>Ergänze den Vorrat mit zusätzlichen Hygieneartikeln und Hilfsmitteln.</li>
                        <li>Erarbeite einen individuellen Evakuierungsplan für Kinder und Senioren.</li>
                        <li>Denke auch an tiergerechte Notfallpakete für Haustiere.</li>
                    </ul>
                </p>
                <p>
                    Eine umfassende Planung, die alle individuellen Anforderungen berücksichtigt, stellt sicher, dass niemand im Notfall zu kurz kommt.
                </p>
            </>
        ),
    },
};

export default function NotfallDetail() {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const detail = detailsContent[category || "lebensmittel"] || {
        title: "Nicht gefunden",
        image: "",
        content: "Für diese Kategorie liegen derzeit keine Informationen vor.",
    };

    // Behandelt das Scrollen zu Anchor-Links innerhalb der Komponente
    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                // Kleine Verzögerung, damit der Content gerendert ist
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.hash, category]);

    return (
        <div className={style.container}>
            <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/")}
                style={{ marginBottom: "16px" }}
            >
                Zurück
            </Button>
            <Title level={2}>{detail.title}</Title>
            {detail.image && (
                <img
                    src={detail.image}
                    alt={detail.title}
                    style={{ maxWidth: "100%", marginBottom: "16px" }}
                />
            )}
            <Paragraph>{detail.content}</Paragraph>
        </div>
    );
}
