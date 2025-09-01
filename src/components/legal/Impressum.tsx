import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

export default function Impressum() {
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
            <Title level={2}>Impressum</Title>
            <Paragraph>
                Angaben gemäß § 5 TMG und § 18 MStV. Bitte ersetzen Sie die Platzhalter mit Ihren tatsächlichen Angaben.
            </Paragraph>

            <Title level={3}>Anbieter</Title>
            <Paragraph>
                <Text strong>Sebastian Meine</Text><br />
                Hauptstraße 24<br />
                56237 Nauort<br />
                Deutschland
            </Paragraph>

            <Title level={3}>Kontakt</Title>
            <Paragraph>
                Telefon: — (kein Telefonkontakt vorgesehen)<br />
                E-Mail: <a href="mailto:webmaster@meinedevpath.de">webmaster@meinedevpath.de</a>
            </Paragraph>

            <Title level={3}>Vertretungsberechtigte Person</Title>
            <Paragraph>
                Entfällt (Einzelperson)
            </Paragraph>

            <Title level={3}>Registereintrag</Title>
            <Paragraph>
                Nicht vorhanden
            </Paragraph>

            <Title level={3}>Umsatzsteuer-ID</Title>
            <Paragraph>
                Nicht vorhanden
            </Paragraph>

            <Title level={3}>Zuständige Aufsichtsbehörde</Title>
            <Paragraph>
                Nicht zutreffend
            </Paragraph>

            <Title level={3}>Berufsrechtliche Angaben (falls zutreffend)</Title>
            <Paragraph>
                Nicht zutreffend (keine reglementierte Berufsgruppe)
            </Paragraph>

            <Title level={3}>Verantwortlich i.S.d. § 18 Abs. 2 MStV</Title>
            <Paragraph>
                Sebastian Meine, Hauptstraße 24, 56237 Nauort, Deutschland
            </Paragraph>

            <Title level={3}>Nutzergenerierte Inhalte (User-Content)</Title>
            <Paragraph>
                Für Inhalte, die von Nutzern innerhalb der Anwendung erstellt oder hochgeladen werden, sind die jeweiligen Nutzer verantwortlich.
                Rechtswidrige Inhalte werden nach Kenntniserlangung umgehend entfernt oder der Zugang dazu gesperrt (§§ 8–10 TMG).
            </Paragraph>

            <Title level={3}>EU-Streitschlichtung</Title>
            <Paragraph>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">https://ec.europa.eu/consumers/odr</a>.
            </Paragraph>

            <Title level={3}>Haftung für Inhalte</Title>
            <Paragraph>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
                oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
                Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis
                einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </Paragraph>

            <Title level={3}>Haftung für Links</Title>
            <Paragraph>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte
                auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
                Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung
                nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </Paragraph>

            <Title level={3}>Urheberrecht</Title>
            <Paragraph>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw.
                Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite
                nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet und entsprechende Inhalte gekennzeichnet.
            </Paragraph>

            <Title level={3}>Bildnachweise</Title>
            <Paragraph>
                Soweit nicht anders angegeben, stammen verwendete Bilder/Grafiken aus eigenen Quellen. App-Logos und Symbole unterliegen ggf. den Rechten der jeweiligen Inhaber.
            </Paragraph>
        </div>
    );
}
