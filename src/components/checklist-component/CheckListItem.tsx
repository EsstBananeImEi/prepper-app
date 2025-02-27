import React, { ReactElement, SyntheticEvent, useRef, useState } from 'react';
import { List, Checkbox, Typography, Input, Collapse, InputNumber } from 'antd';
import { Action, useStore } from '../../store/Store';
import { actionHandler } from '../../store/Actions';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

interface ChecklistItem {
    name: string;
    description: string;
    requiredKeys: string[];
    requiredAmount: number; // Pro Tag bei konsumierbaren oder Fixwert bei nicht konsumierbaren Gegenständen
    unit: string;
    perPerson: boolean;  // true: gilt pro Person, false: pro Haushalt
    consumable: boolean; // true: täglich konsumierbar (Ziel = requiredAmount * personCount * 10), false: 1 pro Person (Ziel = requiredAmount * personCount)
}

interface ChecklistGroup {
    name: string;
    items?: ChecklistItem[];
}

const checklistGroups: ChecklistGroup[] = [
    {
        name: 'Lebensmittel',
        items: [
            {
                name: 'Trinkwasser',
                description: 'Mindestens 2 Liter pro Tag pro Person, also 20 Liter für 10 Tage.',
                requiredKeys: ['wasser', 'trinkwasser', 'mineralwasser'],
                requiredAmount: 2,
                unit: 'Liter',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Getreide, Getreideprodukte, Brot',
                description: '3,5 kg für 10 Tage pro Person.',
                requiredKeys: ['getreide', 'brot', 'getreideprodukte'],
                requiredAmount: 3.5,
                unit: 'kg',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Gemüse & Hülsenfrüchte',
                description: '4,0 kg für 10 Tage pro Person.',
                requiredKeys: ['gemüse', 'hülsenfrüchte'],
                requiredAmount: 4.0,
                unit: 'kg',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Obst & Nüsse',
                description: '2,5 kg für 10 Tage pro Person.',
                requiredKeys: ['obst', 'nüsse'],
                requiredAmount: 2.5,
                unit: 'kg',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Milch & Milchprodukte',
                description: '2,6 kg für 10 Tage pro Person.',
                requiredKeys: ['milch', 'milchprodukte'],
                requiredAmount: 2.6,
                unit: 'kg',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Fisch, Fleisch, Eier bzw. Volleipulver',
                description: '1,5 kg für 10 Tage pro Person.',
                requiredKeys: ['fisch', 'fleisch', 'eier', 'volleipulver'],
                requiredAmount: 1.5,
                unit: 'kg',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Fette & Öle',
                description: '0,357 kg für 10 Tage pro Person.',
                requiredKeys: ['fette', 'öle'],
                requiredAmount: 0.357,
                unit: 'kg',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Weitere Lebensmittel',
                description: 'Zucker, Honig, Schokolade, Salz, etc.',
                requiredKeys: ['zucker', 'honig', 'schokolade', 'salz'],
                requiredAmount: 0,
                unit: '',
                perPerson: false,
                consumable: false,
            },
        ],
    },
    {
        name: 'Hygiene',
        items: [
            {
                name: 'Seife',
                description: 'Für die tägliche Körperhygiene.',
                requiredKeys: ['seife'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Zahnbürste & Zahnpasta',
                description: 'Für die Zahnpflege.',
                requiredKeys: ['zahnbürste', 'zahnpasta'],
                requiredAmount: 1,
                unit: 'Tuben',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Toilettenpapier',
                description: 'Für die sanitäre Hygiene.',
                requiredKeys: ['toilettenpapier'],
                requiredAmount: 4,
                unit: 'Rollen',
                perPerson: false,
                consumable: true,
            },
            {
                name: 'Müllbeutel (Wasserdicht)',
                description: 'Für die Abfallentsorgung und in Kombination mit Eimern als Notfalltoilette.',
                requiredKeys: ['müllbeutel'],
                requiredAmount: 10,
                unit: 'Stück',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Desinfektionsmittel',
                description: 'Für die Hand- und Flächendesinfektion.',
                requiredKeys: ['desinfektionsmittel'],
                requiredAmount: 1,
                unit: 'Flasche',
                perPerson: false,
                consumable: true,
            },
            {
                name: 'Hygieneartikel für Frauen',
                description: 'Tampons, Binden, etc.',
                requiredKeys: ['tampons', 'binden'],
                requiredAmount: 1,
                unit: 'Packung',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Optionale Hygieneartikel für Personen mit besonderen Bedürfnissen',
                description: 'Windeln, Feuchttücher, Einlagen, etc.',
                requiredKeys: ['windeln', 'feuchttücher', 'einlagen'],
                requiredAmount: 1,
                unit: 'Packung',
                perPerson: true,
                consumable: true,
            },
        ],
    },
    {
        name: 'Hausapotheke',
        items: [
            {
                name: 'Erste-Hilfe-Set',
                description: 'Komplettes Set für medizinische Notfälle.',
                requiredKeys: ['erste hilfe', 'verbandkasten'],
                requiredAmount: 1,
                unit: 'Set',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Persönliche Medikamente',
                description: 'Ausreichender Vorrat für mindestens 10 Tage.',
                requiredKeys: ['medikamente', 'arznei'],
                requiredAmount: 10,
                unit: 'Tage',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Schmerzmittel',
                description: 'Zur Linderung von Schmerzen.',
                requiredKeys: ['schmerzmittel', 'paracetamol', 'ibuprofen'],
                requiredAmount: 1,
                unit: 'Packung',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Wunddesinfektionsmittel',
                description: 'Zur Reinigung von Wunden. (Alternativ: hochprozentiger Alkohol 70%)',
                requiredKeys: ['wunddesinfektion', 'desinfektionsmittel', 'jod', 'octenisept', 'isopropanol'],
                requiredAmount: 1,
                unit: 'Flasche',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Fieberthermometer',
                description: 'Zur Messung der Körpertemperatur.',
                requiredKeys: ['fieberthermometer'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Pinzette',
                description: 'Zum Entfernen von Splittern, Zecken, etc.',
                requiredKeys: ['pinzette'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
        ],
    },
    {
        name: 'Energieausfall',
        items: [
            {
                name: 'Kerzen, Teelichter',
                description:
                    'Mehrere Kerzen und Teelichter als Lichtquelle in Notfällen. Viele Notfallempfehlungen gehen pro Person von 2–3 Kerzen pro Tag aus. (Hier als Durchschnitt 30 Stück insgesamt)',
                requiredKeys: ['kerzen', 'teelichter', 'kerze', 'grablicht', 'grabkerze'],
                requiredAmount: 30,
                unit: 'Stück',
                perPerson: false,
                consumable: true,
            },
            {
                name: 'Streichhölzer & Feuerzeug',
                description:
                    'Zündquelle für Kerzen und Lagerfeuer. (Feuerzeuge sollten auch bei Nässe funktionsfähig sein. Hier werden Streichhölzer angenommen.)',
                requiredKeys: ['streichhölzer', 'feuerzeug', 'zippo'],
                requiredAmount: 2,
                unit: 'Packungen',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Taschenlampe',
                description: 'Batteriebetriebene Taschenlampe für den Notfalleinsatz – pro Person eine zusätzliche Lampe.',
                requiredKeys: ['taschenlampe'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Radio',
                description: 'Radio mit Batterie- oder Kurbelbetrieb zur Informationsbeschaffung.',
                requiredKeys: ['radio'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Batterien',
                description: 'Ersatzbatterien für diverse Geräte (hier 6 Batterien pro Gerät, z.B. Taschenlampe und Radio).',
                requiredKeys: ['batterien', 'aa', 'aaa', 'batterie'],
                requiredAmount: 24,
                unit: 'Stück',
                perPerson: false,
                consumable: true,
            },
            {
                name: 'Camping-/Spirituskocher oder Bushbox',
                description: 'Kleiner Kocher für den Notfalleinsatz.',
                requiredKeys: ['kocher', 'campingkocher', 'spirituskocher'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Brennstoffe',
                description: 'Notwendige Brennstoffe (z.B. Spiritus, Gas, Brennpaste) für den Kocher oder Heizquelle.',
                requiredKeys: ['brennstoffe', 'brennstoff'],
                requiredAmount: 3,
                unit: 'Kg',
                perPerson: false,
                consumable: true,
            },
            {
                name: 'Heizgelegenheit',
                description: 'Alternative Heizquelle für den Fall eines Stromausfalls.',
                requiredKeys: ['heizgelegenheit', 'heizung'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
        ],
    },
    {
        name: 'Brandschutz',
        items: [
            {
                name: 'Feuerlöscher',
                description: 'Zum Löschen von Bränden im Notfall.',
                requiredKeys: ['feuerlöscher'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Löschspray',
                description: 'Schnell einsatzbereites Löschmittel für kleine Brände.',
                requiredKeys: ['löschspray'],
                requiredAmount: 1,
                unit: 'Dose',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Rauchmelder',
                description: 'Zur frühzeitigen Erkennung von Bränden.',
                requiredKeys: ['rauchmelder'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Wassereimer / Kübel',
                description: 'Behälter für Löschwasser.',
                requiredKeys: ['wassereimer', 'kübel'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Garten- oder Autowaschschlauch',
                description: 'Zum Bereitstellen von Löschwasser im Außenbereich.',
                requiredKeys: ['waschschlauch', 'gartenschlauch', 'wasserschlauch', 'schlauch'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
        ],
    },
    {
        name: 'Dokumentensicherung',
        items: [
            {
                name: 'Dokumentenmappe',
                description: 'Sichere Aufbewahrung wichtiger Dokumente in einer Mappe.',
                requiredKeys: ['dokumentenmappe'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Dokumentenkopien & Beglaubigungen',
                description: 'Kopien wichtiger Dokumente anfertigen und ggf. beglaubigen lassen.',
                requiredKeys: ['dokumentenkopie', 'beglaubigung'],
                requiredAmount: 1,
                unit: 'Set',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Digitale Datensicherung',
                description: 'Externe Festplatte oder USB-Stick für digitale Backups.',
                requiredKeys: ['festplatte', 'usb', 'datensicherung'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
        ],
    },
    {
        name: 'Notgepäck',
        items: [
            {
                name: 'Schlafsack / Decke',
                description: 'Leichter Schlafsack oder Decke als Wärmequelle.',
                requiredKeys: ['schlafsack', 'decke'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Wasserdichte Jacke',
                description: 'Wasser- und winddichte Jacke (z.B. Regenjacke, Goretex-Jacke, Segeljacke etc.) als Schutz vor Nässe.',
                requiredKeys: ['jacke', 'wasserdicht'],
                requiredAmount: 1,
                unit: 'Set',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Wärmende Jacke / Wärmende Kleidung',
                description: 'Eine warme Jacke oder wärmende Kleidung, die unter die wasserdichte Jacke passt.',
                requiredKeys: ['warmer pullover', 'wärmende kleidung', 'fleece jacke', 'fleece pullover', 'wollpullover', 'wolljacke', 'warme jacke'],
                requiredAmount: 1,
                unit: 'Set',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Wechselsocken & Funktionsunterwäsche',
                description: 'Ein Set aus Wechselsocken und Funktionsunterwäsche.',
                requiredKeys: ['socken', 'unterwäsche', 'funktionsunterwäsche'],
                requiredAmount: 1,
                unit: 'Set',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Notnahrung (Trekkingnahrung)',
                description: 'Nahrung für 1-2 Tage als Notnahrung.',
                requiredKeys: ['notnahrung', 'trekkingnahrung'],
                requiredAmount: 1,
                unit: 'Packung',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Snacks & Energieriegel',
                description: 'Snacks und Energieriegel für den Notfall.',
                requiredKeys: ['snacks', 'energieriegel'],
                requiredAmount: 1,
                unit: 'Packung',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'Ess- und Kochgeschirr inkl. Campingkocher',
                description: 'Ess- und Kochgeschirr als Set, ggf. mit Campingkocher und Brennstoffvorrat.',
                requiredKeys: ['geschirr', 'kocher', 'brennstoff'],
                requiredAmount: 1,
                unit: 'Set',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Kaffee oder Tee',
                description: '1 Packung Kaffee oder Tee als zusätzliche Verpflegung.',
                requiredKeys: ['kaffee', 'tee'],
                requiredAmount: 1,
                unit: 'Packung',
                perPerson: true,
                consumable: true,
            },
            {
                name: 'SOS-Kapsel für Kinder',
                description: 'SOS-Kapsel mit Anschrift und Kontaktdaten für Kinder.',
                requiredKeys: ['sos kapsel', 'kinder kapsel', 'kinder id'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Regenhülle für den Rucksack',
                description: 'Schutz für den Rucksack vor Regen. Eine pro Rucksack.',
                requiredKeys: ['regenhülle', 'rucksack'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Taschenmesser',
                description: 'Ein vielseitiges Taschenmesser als Werkzeug.',
                requiredKeys: ['taschenmesser', 'schweizer messer'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: false,
                consumable: false,
            },
            {
                name: 'Taschenlampe / Stirnlampe',
                description: 'Für den Notfalleinsatz – eine pro Person.',
                requiredKeys: ['taschenlampe', 'stirnlampe'],
                requiredAmount: 1,
                unit: 'Stück',
                perPerson: true,
                consumable: false,
            },
            {
                name: 'Ersatzbatterien',
                description: 'Für die Taschenlampe, hier angenommen 6 Batterien pro Gerät.',
                requiredKeys: ['batterien', 'aa', 'aaa', 'batterie'],
                requiredAmount: 6,
                unit: 'Stück',
                perPerson: false,
                consumable: true,
            },
            {
                name: 'Powerbank, Ladegeräte und Ladekabel',
                description: 'Ein Set zur Aufladung mobiler Geräte.',
                requiredKeys: ['powerbank', 'ladegerät'],
                requiredAmount: 1,
                unit: 'Set',
                perPerson: false,
                consumable: false,
            },
        ],
    },
];

export default function ChecklistComponent(): ReactElement {
    const { store, dispatch } = useStore();
    const availableItems = store.storeItems || [];
    // Hier verwenden wir einen number-State für die Personenzahl
    const [personCount, setPersonCount] = useState<number | undefined>(store.user?.persons || 1);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getAvailableTotal = (requiredKeys: string[]): number => {
        return availableItems.reduce((sum, item) => {
            const matches = requiredKeys.some(key =>
                item.name.toLowerCase().includes(key.toLowerCase()) ||
                (item.categories && item.categories.some(c => c.toLowerCase().includes(key.toLowerCase())))
            );
            return matches ? sum + item.amount : sum;
        }, 0);
    };

    const getStatus = (
        requiredKeys: string[],
        requiredAmount: number,
        unit: string,
        perPerson: boolean,
        consumable: boolean
    ): { status: 'green' | 'yellow' | 'red'; available: number; target: number } => {
        const count = personCount !== undefined ? personCount : 1;
        const target = perPerson
            ? (consumable ? requiredAmount * count * 10 : requiredAmount * count)
            : requiredAmount;
        const available = getAvailableTotal(requiredKeys);
        let status: 'green' | 'yellow' | 'red' = 'red';
        if (available >= target) {
            status = 'green';
        } else if (available > 0) {
            status = 'yellow';
        }
        return { status, available, target };
    };

    return (
        <div style={{ padding: '20px' }}>
            <Title level={3}>Checkliste für die Notfallvorsorge</Title>
            <Paragraph>Vorrat für zehn Tage pro Person nach Empfehlung des BBK.</Paragraph>
            <div style={{ marginBottom: '20px' }}>
                <span style={{ marginRight: '10px' }}>Anzahl Personen:</span>
                <InputNumber
                    min={1}
                    value={personCount}
                    onChange={(value) => setPersonCount(value || 1)}
                    style={{ width: '100px' }}
                />
            </div>
            <Collapse accordion>
                {checklistGroups.map((group, groupIndex) => (
                    <Panel header={group.name} key={groupIndex}>
                        <List
                            itemLayout="horizontal"
                            dataSource={group.items}
                            renderItem={(item) => {
                                const { status, available, target } = getStatus(
                                    item.requiredKeys,
                                    item.requiredAmount,
                                    item.unit,
                                    item.perPerson,
                                    item.consumable
                                );
                                return (
                                    <List.Item
                                        style={{
                                            backgroundColor:
                                                status === 'green'
                                                    ? '#dff0d8'
                                                    : status === 'yellow'
                                                        ? '#fcf8e3'
                                                        : '#f2dede',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <span>
                                                    <Checkbox checked={available >= target} disabled /> {item.name}
                                                </span>
                                            }
                                            description={
                                                <>
                                                    {item.description} <br />
                                                    Erforderlich: {target} {item.unit} | Vorhanden: {available} {item.unit}
                                                </>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </Panel>
                ))}
            </Collapse>
        </div>
    );
}