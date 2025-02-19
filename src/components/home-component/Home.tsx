import { Alert, Avatar, Collapse, Typography } from 'antd';
import React, { ReactElement } from 'react';
import style from './Home.module.css';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const recommendations = [
    {
        title: "Lebensmittelvorrat",
        description:
            "Die Bundesregierung empfiehlt, einen Vorrat an lang haltbaren Lebensmitteln für mindestens 10 Tage anzulegen. Dies umfasst Konserven, Trockenprodukte, Reis, Nudeln sowie zusätzliche Artikel für spezielle Ernährungsbedürfnisse. Achten Sie darauf, dass der Vorrat abwechslungsreich und ausgewogen ist.",
        avatar: "/lebensmittel.png"
    },
    {
        title: "Trinkwasser",
        description:
            "Pro Person sollten mindestens 2 Liter Trinkwasser pro Tag für 10 Tage bereitgestellt werden. Dabei ist es wichtig, das Wasser in geeigneten Behältnissen hygienisch zu lagern. Überprüfen Sie regelmäßig das Haltbarkeitsdatum und den Zustand der Lagerbehälter.",
        avatar: "/wasser.png"
    },
    {
        title: "Medikamente & Erste-Hilfe-Material",
        description:
            "Ein gut ausgestatteter Erste-Hilfe-Kasten sowie ein Vorrat an wichtigen Medikamenten sind unverzichtbar. Neben Standardmaterialien sollten Sie auch persönliche Medikamente (z. B. für chronische Erkrankungen) und eventuell spezielle Hilfsmittel bereithalten.",
        avatar: "/medikamente.png"
    },
    {
        title: "Hygieneartikel & Desinfektionsmittel",
        description:
            "Um Infektionen vorzubeugen, sollten Sie einen Vorrat an Seife, Desinfektionsmitteln, Hygienetüchern und weiteren Pflegeartikeln anlegen. Diese Artikel sind nicht nur im medizinischen Notfall wichtig, sondern auch für den alltäglichen Schutz in Krisenzeiten.",
        avatar: "/hygiene.png"
    },
    {
        title: "Notfallausrüstung & Kommunikation",
        description:
            "Neben den Grundbedarfen sollten auch Geräte wie ein batteriebetriebener Radio, Taschenlampen, Ersatzbatterien und ein Notfallkit für wichtige Dokumente und Bargeld vorhanden sein. Diese Ausrüstung unterstützt Sie dabei, auch im Krisenfall informiert und handlungsfähig zu bleiben.",
        avatar: "/informieren.png"
    },
    {
        title: "Spezielle Bedürfnisse",
        description:
            "Planen Sie zusätzlich für Kinder, ältere Menschen oder Haustiere. Dies umfasst beispielsweise Babynahrung, altersgerechte Medikamente oder Tierfutter. Berücksichtigen Sie dabei auch eventuelle besondere Ernährungsbedürfnisse.",
        avatar: "/beduerfnisse.png"
    },
    {
        title: "Wichtige Dokumente sichern",
        description:
            "Sorgen Sie dafür, dass alle wichtigen Dokumente wie Personalausweis, Reisepass, Versicherungsunterlagen und Bankinformationen an einem sicheren Ort aufbewahrt werden – idealerweise in einem feuerfesten Safe oder digital gesichert.",
        avatar: "/dokumente.png"
    },
    {
        title: "Notgepäck",
        description:
            "Ein Notgepäck sollte schnell griffbereit sein und alle essentiellen Dinge enthalten, wie Bargeld, wichtige Dokumente, ein Mobiltelefon samt Ladegerät, ein Erste-Hilfe-Set, Wasser, Snacks und Wechselkleidung. Packen Sie es so, dass Sie im Notfall zügig das Haus verlassen können.",
        avatar: "/gepaeck.png"
    },
    {
        title: "Sicherheit im Haus",
        description:
            "Überprüfen Sie, ob Ihr Zuhause im Krisenfall sicher ist. Dazu gehören funktionierende Alarmanlagen, stabile Sicherheitsschlösser, frei zugängliche Notausgänge und ein klar definierter Evakuierungsplan. Achten Sie auch darauf, dass potenzielle Gefahrenquellen minimiert werden.",
        avatar: "/sicherheit.png"
    }
];

export default function Home(): ReactElement {
    return (
        <div className={style.mycontainer}>
            <Title level={2}>Empfehlungen der Bundesregierung zur Lagerhaltung</Title>
            <Paragraph>
                Im Rahmen der Notfallvorsorge rät die Bundesregierung, einen umfassenden Vorrat an lebenswichtigen Gütern anzulegen.
            </Paragraph>
            <Collapse defaultActiveKey={[]} accordion>
                {recommendations.map((item, index) => (
                    <Panel
                        header={
                            <div className={style.panelHeader}>
                                <Avatar src={item.avatar} size={64} className={style.avatar} />
                                <span className={style.paneltitle}>{item.title}</span>
                            </div>
                        }
                        key={index}
                    >
                        <Paragraph>{item.description}</Paragraph>
                    </Panel>
                ))}
            </Collapse>
            <div className={style.infosection}>
                <Title level={4}>Weitere Informationen</Title>
                <Paragraph>
                    Laden Sie den{' '}
                    <a
                        href="https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/Buergerinformationen/Ratgeber/ratgeber-notfallvorsorge.pdf?__blob=publicationFile&v=32"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ratgeber Notfallvorsorge
                    </a>{' '}
                    herunter, um detaillierte Hinweise und weiterführende Informationen zu erhalten.
                </Paragraph>
                <Paragraph>
                    Die{' '}
                    <a
                        href="https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/Buergerinformationen/Ratgeber/ratgeber-notfallvosorge-checkliste.pdf?__blob=publicationFile&v=10"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Checkliste Notfallvorsorge
                    </a>{' '}
                    wird zukünftig durch eine interaktive Komponente ersetzt, die automatisch Ihren Lagerbestand überprüft und die Liste abhakt.
                </Paragraph>
                <Paragraph>
                    Weitere Informationen und konkrete Handlungsempfehlungen finden Sie auch auf der offiziellen Seite des BBK:{' '}
                    <a
                        href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/vorsorge_node.html#:~:text=Wir%20empfehlen%20mindestens%20einen%20Vorrat,eine%20Woche%20bis%20zehn%20Tage."
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        BBK - Vorsorge im Krisenfall
                    </a>
                </Paragraph>
            </div>
            <Alert
                message="Hinweis"
                description="Diese Empfehlungen dienen als Orientierung und sollten an Ihre individuellen Bedürfnisse angepasst werden. Prüfen Sie regelmäßig Ihren Vorrat und aktualisieren Sie diesen bei Bedarf."
                type="info"
                showIcon
                className={style.alert}
            />
        </div>
    );
}
