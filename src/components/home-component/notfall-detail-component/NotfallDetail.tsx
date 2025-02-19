import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import React from 'react';
import style from './NotfallDetail.module.css';

const { Title, Paragraph } = Typography;

type DetailContent = {
    title: string;
    image: string; // Bildlink (Avatar) aus der Home Component
    content: React.ReactNode;
};

const detailsContent: Record<string, DetailContent> = {
    lebensmittel: {
        title: "Lebensmittelvorrat",
        image: "/lebensmittel.png",
        content: (
            <>
                <p>
                    Ein gut durchdachter Lebensmittelvorrat ist der Schlüssel zur Selbstversorgung in Krisenzeiten. Die Bundesregierung empfiehlt, einen Vorrat an lang haltbaren Lebensmitteln für mindestens 10 Tage anzulegen – dazu gehören Konserven, Trockenprodukte, Reis, Nudeln und spezielle Artikel für individuelle Ernährungsbedürfnisse.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Nutze Online-Vorratskalulatoren, um den exakten Bedarf pro Person zu ermitteln.</li>
                        <li>Lagere Lebensmittel in luftdichten Behältern und achte darauf, dass sie kühl, trocken und lichtgeschützt aufbewahrt werden.</li>
                        <li>Rotiere deinen Vorrat regelmäßig, um ablaufende Produkte zu vermeiden.</li>
                        <li>Setze auf alternative Konservierungsmethoden wie Einmachen, Trocknen oder Einfrieren.</li>
                    </ul>
                </p>
                <p>
                    Ein gut organisierter Vorrat ermöglicht es, auch bei längeren Versorgungsengpässen flexibel und sicher zu bleiben.
                </p>
            </>
        ),
    },
    wasser: {
        title: "Trinkwasservorrat",
        image: "/wasser.png",
        content: (
            <>
                <p>
                    Wasser ist das Lebenselixier – ohne ausreichend Trinkwasser steht schnell nichts mehr. Pro Person sollten mindestens 2 Liter pro Tag für 10 Tage eingeplant werden. Wichtig ist, das Wasser in geeigneten, hygienisch einwandfreien Behältnissen zu lagern.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Verwende robuste, lebensmittelechte Kanister oder Flaschen.</li>
                        <li>Überprüfe regelmäßig das Haltbarkeitsdatum und den Zustand der Lagerbehälter.</li>
                        <li>Halte Wasseraufbereitungstabletten und Filter bereit, um die Wasserqualität im Notfall sicherzustellen.</li>
                    </ul>
                </p>
                <p>
                    So stellst du sicher, dass du auch in Krisenzeiten stets über ausreichend sauberes Wasser verfügst.
                </p>
            </>
        ),
    },
    medikamente: {
        title: "Medikamente & Erste-Hilfe",
        image: "/medikamente.png",
        content: (
            <>
                <p>
                    Eine gut ausgestattete Hausapotheke kann im Notfall über Leben und Tod entscheiden. Neben Standardmedikamenten sollten auch spezielle Präparate für chronische Erkrankungen vorrätig sein. Achte darauf, dass alle Medikamente aktuell und innerhalb des Haltbarkeitsdatums sind.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Regelmäßige Kontrolle der Verfallsdaten ist essenziell.</li>
                        <li>Ergänze deine Hausapotheke mit Verbandsmaterial, Desinfektionsmitteln und Schmerzmitteln.</li>
                        <li>Bewahre persönliche, vom Arzt verschriebene Medikamente separat und kindersicher auf.</li>
                        <li>Nimm an Erste-Hilfe-Kursen teil, um im Notfall schnell und richtig handeln zu können.</li>
                    </ul>
                </p>
                <p>
                    Mit einer aktuellen und gut organisierten Hausapotheke bist du optimal auf Notfälle vorbereitet.
                </p>
            </>
        ),
    },
    hygiene: {
        title: "Hygiene & Desinfektion",
        image: "/hygiene.png",
        content: (
            <>
                <p>
                    Gerade in Krisenzeiten ist Hygiene von größter Bedeutung, um Infektionen und Krankheiten vorzubeugen. Ein ausreichender Vorrat an Seife, Desinfektionsmitteln, Hygienetüchern und weiteren Pflegeartikeln sollte daher unbedingt vorhanden sein.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Setze auf multifunktionale Hygieneprodukte, die auch ohne fließendes Wasser wirken.</li>
                        <li>Lagere Einweggeschirr und Besteck, um den Wasserverbrauch zu minimieren.</li>
                        <li>Plane alternative Methoden zur Körperhygiene, falls die Wasserversorgung unterbrochen ist.</li>
                        <li>Überprüfe regelmäßig deinen Hygienevorrat und fülle ihn rechtzeitig auf.</li>
                    </ul>
                </p>
                <p>
                    So schützt du deine Familie auch in schwierigen Zeiten vor Keimen und Infektionen.
                </p>
            </>
        ),
    },
    informieren: {
        title: "Notfallausrüstung & Kommunikation",
        image: "/informieren.png",
        content: (
            <>
                <p>
                    In einer Krisensituation zählt jede Minute. Eine umfassende Notfallausrüstung sollte daher neben batteriebetriebenen Radios und Taschenlampen auch Ersatzbatterien, Powerbanks, sowie alternative Kochmöglichkeiten beinhalten. Zudem sind Geräte zur Kommunikation und Informationsbeschaffung unverzichtbar.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Teste regelmäßig die Funktionstüchtigkeit aller Geräte.</li>
                        <li>Bewahre die Notfallausrüstung an einem zentralen, leicht zugänglichen Ort auf.</li>
                        <li>Erstelle eine Checkliste, um den Zustand und die Vollständigkeit der Ausrüstung zu überwachen.</li>
                        <li>Informiere dich über zusätzliche Kommunikationsmittel, wie Notfall-Apps oder Funkgeräte.</li>
                    </ul>
                </p>
                <p>
                    Mit einer gepflegten Notfallausrüstung bist du auch in extremen Situationen handlungsfähig.
                </p>
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
    dokumente: {
        title: "Wichtige Dokumente",
        image: "/dokumente.png",
        content: (
            <>
                <p>
                    Bewahre alle wichtigen Dokumente wie Personalausweis, Reisepass, Versicherungsunterlagen und Bankinformationen an einem sicheren Ort auf – idealerweise in einer wasserdichten und feuerfesten Dokumentenmappe. Digitale Kopien und Scans können im Notfall zusätzlich hilfreich sein.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Erstelle Duplikate und sichere digitale Versionen deiner Dokumente.</li>
                        <li>Lagere die Dokumentenmappe an einem zentralen und gut zugänglichen Ort.</li>
                        <li>Informiere alle Familienmitglieder über den Aufbewahrungsort.</li>
                        <li>Führe regelmäßige Updates durch, um die Aktualität der Dokumente zu gewährleisten.</li>
                    </ul>
                </p>
                <p>
                    So bist du im Notfall schnell in der Lage, wichtige Formalitäten zu erledigen und Schäden zu minimieren.
                </p>
            </>
        ),
    },
    gepaeck: {
        title: "Notgepäck",
        image: "/gepaeck.png",
        content: (
            <>
                <p>
                    Ein gut gepacktes Notgepäck ist essenziell, wenn es schnell gehen muss. Jedes Familienmitglied sollte ein individuell abgestimmtes Paket mit den wichtigsten Dingen haben – von persönlichen Dokumenten über wetterfeste Kleidung, Hygieneartikel bis hin zu Notfallmedikamenten und einer funktionierenden Taschenlampe.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Nutze robuste Rucksäcke, die beide Hände frei lassen, damit du im Notfall schnell flüchten kannst.</li>
                        <li>Packe wetterfeste Kleidung sowie alternative Verpflegung ein.</li>
                        <li>Erstelle regelmäßig eine Checkliste und überprüfe den Inhalt deines Notgepäcks.</li>
                        <li>Halte zusätzlich wichtige Gegenstände wie ein batteriebetriebenes Radio bereit.</li>
                    </ul>
                </p>
                <p>
                    Ein gut vorbereitetes Notgepäck verschafft dir und deiner Familie im Ernstfall wertvolle Zeit und Sicherheit.
                </p>
            </>
        ),
    },
    sicherheit: {
        title: "Sicherheit im Haus",
        image: "/sicherheit.png",
        content: (
            <>
                <p>
                    Die bauliche Sicherheit deines Zuhauses ist entscheidend, um im Notfall bestmöglich geschützt zu sein. Überprüfe regelmäßig den Zustand von Dächern, Fenstern, Türen und Installationen. Maßnahmen wie das Anbringen von Sturmhaken, die Installation von Rückstauverschlüssen und der Einsatz von Überspannungsschutz können das Risiko erheblich senken.
                </p>
                <p>
                    <strong>Tipps & Tricks:</strong>
                    <ul>
                        <li>Lass regelmäßig Wartungen an elektrischen Anlagen und Sicherungssystemen durchführen.</li>
                        <li>Sichere Fenster und Türen mit zusätzlichen Vorrichtungen gegen starke Winde und herabfallende Gegenstände.</li>
                        <li>Plane und übe Evakuierungswege mit allen Familienmitgliedern.</li>
                        <li>Installiere Rauchmelder und Feuerlöscher an strategischen Stellen im Haus.</li>
                    </ul>
                </p>
                <p>
                    Durch gezielte bauliche Maßnahmen kannst du das Sicherheitsgefühl in deinem Zuhause deutlich steigern.
                </p>
            </>
        ),
    },
};

export default function NotfallDetail() {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const detail = detailsContent[category || "lebensmittel"] || {
        title: "Nicht gefunden",
        image: "",
        content: "Für diese Kategorie liegen derzeit keine Informationen vor.",
    };

    return (
        <div className={style.container}>
            <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
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
