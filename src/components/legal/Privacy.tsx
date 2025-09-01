import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function Privacy() {
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
            <Title level={2}>Datenschutzerklärung</Title>

            <Title level={3}>1. Verantwortlicher</Title>
            <Paragraph>
                Verantwortlich für die Verarbeitung personenbezogener Daten in dieser App ist:<br />
                Sebastian Meine, Hauptstraße 24, 56237 Nauort, Deutschland, E-Mail: <a href="mailto:webmaster@meinedevpath.de">webmaster@meinedevpath.de</a>
            </Paragraph>

            <Title level={3}>2. Datenschutzbeauftragter</Title>
            <Paragraph>
                Ein Datenschutzbeauftragter ist nicht bestellt.
            </Paragraph>

            <Title level={3}>3. Verarbeitungszwecke und Rechtsgrundlagen</Title>
            <Paragraph>
                Wir verarbeiten personenbezogene Daten für folgende Zwecke:
            </Paragraph>
            <Paragraph>
                a) Benutzerkonto und Authentifizierung (Art. 6 Abs. 1 lit. b DSGVO): Erstellung eines Kontos, Anmeldung/Abmeldung,
                Verwaltung von Sitzungen (Access/Refresh Token), Durchsetzung rechtlicher Hinweise (z. B. Zustimmung zu Impressum & Datenschutz).
            </Paragraph>
            <Paragraph>
                b) Funktion der App (Art. 6 Abs. 1 lit. b DSGVO): Verwaltung von Vorräten, Einkaufslisten, Checklisten und Gruppenfunktionen.
            </Paragraph>
            <Paragraph>
                c) System- und Sicherheitsprotokolle (Art. 6 Abs. 1 lit. f DSGVO): Technische Protokolle (z. B. Fehlerberichte,
                API-Request-Logs im lokalen Debug-Panel im Developer-Modus), Missbrauchs- und Betrugsprävention.
            </Paragraph>
            <Paragraph>
                d) Kommunikation (Art. 6 Abs. 1 lit. b und f DSGVO): E-Mail-Benachrichtigungen, z. B. Einladungen in Gruppen oder sicherheitsrelevante Hinweise.
            </Paragraph>

            <Title level={3}>4. Verarbeitete Datenkategorien</Title>
            <Paragraph>
                • Stammdaten: Benutzername, E-Mail-Adresse, optional Profilbild, Haushaltsgröße/Personenangaben (falls erfasst).<br />
                • Anmeldedaten: Passwort (gehasht beim Anbieter), Authentifizierungs-Token (Access/Refresh).<br />
                • Nutzungsdaten: Request-Zeitpunkte, Statusmeldungen, Fehlermeldungen (im Fehlerfall), Einladungsstatus.<br />
                • Inhaltsdaten: Vorrats-/Einkaufslisten- und Checklisten-Einträge, Kategorien/Orte/Einheiten.
            </Paragraph>

            <Title level={3}>5. Empfänger</Title>
            <Paragraph>
                • Hosting/Plattform-Betrieb: Render, Inc. (&quot;Render&quot;) – Bereitstellung der App-Infrastruktur/Server. Verarbeitung im Auftrag gemäß Art. 28 DSGVO.
                Der konkrete Serverstandort richtet sich nach der gewählten Region (z. B. EU-Region, sofern konfiguriert).<br />
                • E-Mail-Dienst & Domain: STRATO AG (Deutschland) – Versand/Empfang von E-Mails (z. B. Einladungen, Systemhinweise); Domain-Registrar/Weiterleitung.
                Verarbeitung im Auftrag gemäß Art. 28 DSGVO.<br />
                • Interne Empfänger: Administrator/Entwicklung nur, soweit zur Fehlerbehebung erforderlich und unter Vertraulichkeit.
            </Paragraph>

            <Title level={3}>6. Drittlandübermittlung</Title>
            <Paragraph>
                Render ist ein US-Unternehmen. Sofern die App in einer EU-Region betrieben wird, erfolgt die Verarbeitung innerhalb des EWR.
                Sollte eine Verarbeitung außerhalb des EWR (z. B. in den USA) stattfinden, erfolgt die Übermittlung auf Grundlage geeigneter Garantien
                gemäß Art. 46 DSGVO (insbesondere EU-Standardvertragsklauseln) sowie ggf. zusätzlicher technischer/organisatorischer Maßnahmen.
                STRATO verarbeitet Daten in der Regel innerhalb Deutschlands/EU; eine Drittlandübermittlung ist hierbei nicht vorgesehen.
            </Paragraph>

            <Title level={3}>7. Speicherdauer</Title>
            <Paragraph>
                Wir speichern personenbezogene Daten solange dies für die jeweiligen Zwecke erforderlich ist. Kontodaten werden bis zur Löschung des Kontos,
                gesetzliche Aufbewahrungsfristen bleiben unberührt. Protokolle und Fehlermeldungen werden regelmäßig überprüft und gelöscht, sobald nicht mehr erforderlich.
            </Paragraph>

            <Title level={3}>8. Rechte der betroffenen Personen</Title>
            <Paragraph>
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen Verarbeitungen,
                die auf Art. 6 Abs. 1 lit. f DSGVO beruhen. Soweit eine Verarbeitung auf Ihrer Einwilligung beruht, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.
            </Paragraph>

            <Title level={3}>9. Beschwerderecht</Title>
            <Paragraph>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
            </Paragraph>

            <Title level={3}>10. Automatisierte Entscheidungsfindung / Profiling</Title>
            <Paragraph>
                Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.
            </Paragraph>

            <Title level={3}>11. Cookies & Tracking</Title>
            <Paragraph>
                Diese App setzt technisch notwendige Cookies/Storage (z. B. Tokens, Spracheinstellungen). Es findet kein Marketing-Tracking statt.
                Im Developer-Modus können lokale Debug-Informationen (API-Logs, Fehler) im Browser gespeichert werden – diese Daten verlassen Ihren Browser nicht.
            </Paragraph>

            <Title level={3}>12. Sicherheit</Title>
            <Paragraph>
                Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen
                (z. B. HTTPS/TLS, Zugriffskontrollen, serverseitige Validierung, Token-basierte Authentifizierung).
            </Paragraph>

            <Title level={3}>13. Kontakt</Title>
            <Paragraph>
                Für Anfragen zur Datenverarbeitung wenden Sie sich an: Sebastian Meine, Hauptstraße 24, 56237 Nauort, Deutschland, E-Mail: <a href="mailto:webmaster@meinedevpath.de">webmaster@meinedevpath.de</a>
            </Paragraph>
        </div>
    );
}
