import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Button, Collapse, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import style from './NotfallDetail.module.css';
import { useTranslation } from 'react-i18next';
import { homeRoute } from '../../../shared/Constants';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

type DetailContent = {
    title: string;
    image: string;
    content: React.ReactNode;
};

// Allow i18n options like returnObjects via TFunction type
import type { TFunction } from 'i18next';

function getDetailsContent(t: TFunction): Record<string, DetailContent> {
    return {
        lebensmittel: {
            title: t('emergency.titles.lebensmittel'),
            image: "/lebensmittel.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#warum">{t('emergency.sections.why')}</a></li>
                            <li><a href="#vorratstyp">{t('emergency.sections.storageType')}</a></li>
                            <li><a href="#tipps">{t('emergency.sections.tips')}</a></li>
                        </ul>
                    </div>

                    {/* Abschnitt: Warum bevorraten? */}
                    <div id="warum">
                        <h4>{t('emergency.sections.why')}</h4>
                        <p>{t('emergency.content.lebensmittel.why.intro')}</p>
                        <ul>
                            <li>{t('emergency.content.lebensmittel.why.b1')}</li>
                            <li>{t('emergency.content.lebensmittel.why.b2')}</li>
                            <li>{t('emergency.content.lebensmittel.why.b3')}</li>
                            <li>{t('emergency.content.lebensmittel.why.b4')}</li>
                        </ul>
                        <p>{t('emergency.content.lebensmittel.why.outro')}</p>
                    </div>

                    {/* Abschnitt: Welcher Vorratstyp sind Sie? */}
                    <div id="vorratstyp">
                        <h4>{t('emergency.sections.storageType')}</h4>
                        <p>{t('emergency.content.lebensmittel.storageType.intro')}</p>
                        <p>
                            <b>{t('emergency.content.lebensmittel.storageType.once.title')}</b>
                        </p>
                        <ul>
                            <li>{t('emergency.content.lebensmittel.storageType.once.i1')}</li>
                            <li>{t('emergency.content.lebensmittel.storageType.once.i2')}</li>
                            <li>{t('emergency.content.lebensmittel.storageType.once.i3')}</li>
                        </ul>
                        <p>
                            <b>{t('emergency.content.lebensmittel.storageType.live.title')}</b>
                        </p>
                        <ul>
                            <li>{t('emergency.content.lebensmittel.storageType.live.i1')}</li>
                            <li>{t('emergency.content.lebensmittel.storageType.live.i2')}</li>
                            <li>{t('emergency.content.lebensmittel.storageType.live.i3')}</li>
                        </ul>
                    </div>

                    {/* Abschnitt: Tipps für die Zusammenstellung eines Vorrats */}
                    <div id="tipps">
                        <h4>{t('emergency.sections.tips')}</h4>
                        <p>{t('emergency.content.lebensmittel.tips.intro')}</p>
                        <ul>
                            <li>{t('emergency.content.lebensmittel.tips.b1')}</li>
                            <li>{t('emergency.content.lebensmittel.tips.b2')}</li>
                            <li>{t('emergency.content.lebensmittel.tips.b3')}</li>
                            <li>{t('emergency.content.lebensmittel.tips.b4')}</li>
                            <li>{t('emergency.content.lebensmittel.tips.b5')}</li>
                            <li>{t('emergency.content.lebensmittel.tips.b6')}</li>
                            <li>{t('emergency.content.lebensmittel.tips.b7')}</li>
                        </ul>
                        <p>{t('emergency.content.lebensmittel.tips.outro')}</p>
                    </div>
                </>
            ),
        },
        wasser: {
            title: t('emergency.titles.wasser'),
            image: "/wasser.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#warumWasser">{t('emergency.sections.why')}</a></li>
                            <li><a href="#lagerungWasser">{t('emergency.sections.storageAndTreatment')}</a></li>
                            <li><a href="#tippsWasser">{t('emergency.sections.waterTips')}</a></li>
                        </ul>
                    </div>

                    {/* Abschnitt: Warum bevorraten? */}
                    <div id="warumWasser">
                        <h4>{t('emergency.sections.why')}</h4>
                        <p>{t('emergency.content.wasser.why.p1')}</p>
                        <p>{t('emergency.content.wasser.why.p2')}</p>
                    </div>

                    {/* Abschnitt: Lagerung & Aufbereitung */}
                    <div id="lagerungWasser">
                        <h4>{t('emergency.sections.storageAndTreatment')}</h4>
                        <p>{t('emergency.content.wasser.storageAndTreatment.p1')}</p>
                        <p>{t('emergency.content.wasser.storageAndTreatment.p2')}</p>
                    </div>

                    {/* Abschnitt: Tipps zur Trinkwasservorrat */}
                    <div id="tippsWasser">
                        <h4>{t('emergency.sections.waterTips')}</h4>
                        <ul>
                            <li>{t('emergency.content.wasser.tips.b1')}</li>
                            <li>{t('emergency.content.wasser.tips.b2')}</li>
                            <li>{t('emergency.content.wasser.tips.b3')}</li>
                            <li>{t('emergency.content.wasser.tips.b4')}</li>
                        </ul>
                    </div>
                </>
            ),
        },
        medikamente: {
            title: t('emergency.titles.medikamente'),
            image: "/medikamente.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#gut-vorbereitet">{t('emergency.sections.wellPrepared')}</a></li>
                            <li><a href="#aufbewahrung">{t('emergency.sections.storageHints')}</a></li>
                            <li><a href="#inhalte">{t('emergency.sections.homePharmacyContents')}</a></li>
                            <li><a href="#aktuell">{t('emergency.sections.upToDate')}</a></li>
                        </ul>
                    </div>

                    {/* Abschnitt: So sind Sie gut vorbereitet */}
                    <div id="gut-vorbereitet">
                        <h4>{t('emergency.sections.wellPrepared')}</h4>
                        <p>{t('emergency.content.medikamente.wellPrepared.p1')}</p>
                        <p>{t('emergency.content.medikamente.wellPrepared.p2')}</p>
                    </div>

                    {/* Abschnitt: Hinweise zur richtigen Aufbewahrung */}
                    <div id="aufbewahrung">
                        <h4>{t('emergency.sections.storageHints')}</h4>
                        <p>{t('emergency.content.medikamente.storageHints.p1')}</p>
                        <p>{t('emergency.content.medikamente.storageHints.p2')}</p>
                    </div>

                    {/* Abschnitt: Das gehört in eine Hausapotheke */}
                    <div id="inhalte">
                        <h4>{t('emergency.sections.homePharmacyContents')}</h4>
                        <p>{t('emergency.content.medikamente.homePharmacyContents.intro')}</p>
                        <ul>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b1')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b2')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b3')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b4')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b5')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b6')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b7')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b8')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b9')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b10')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b11')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b12')}</li>
                            <li>{t('emergency.content.medikamente.homePharmacyContents.b13')}</li>
                        </ul>
                    </div>

                    {/* Abschnitt: Immer auf dem aktuellen Stand */}
                    <div id="aktuell">
                        <h4>{t('emergency.sections.upToDate')}</h4>
                        <p>{t('emergency.content.medikamente.upToDate.p1')}</p>
                        <p>{t('emergency.content.medikamente.upToDate.p2')}</p>
                    </div>
                </>
            ),
        },
        dokumente: {
            title: t('emergency.titles.dokumente'),
            image: "/dokumente.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#alles">{t('emergency.sections.allInOnePlace')}</a></li>
                            <li><a href="#mappe">{t('emergency.sections.documentFolderContents')}</a></li>
                            <li><a href="#tipps">{t('emergency.sections.updateAndSecure')}</a></li>
                        </ul>
                    </div>

                    {/* Abschnitt: Alles Wichtige an einem Platz */}
                    <div id="alles">
                        <h4>{t('emergency.sections.allInOnePlace')}</h4>
                        <p>{t('emergency.content.dokumente.allInOnePlace.p1')}</p>
                        <p>{t('emergency.content.dokumente.allInOnePlace.p2')}</p>
                    </div>

                    {/* Abschnitt: Das gehört in die Dokumentenmappe */}
                    <div id="mappe">
                        <h4>{t('emergency.sections.documentFolderContents')}</h4>
                        <p>{t('emergency.content.dokumente.documentFolderContents.intro')}</p>
                        <p><strong>{t('emergency.content.dokumente.documentFolderContents.titles.original')}</strong></p>
                        <ul>
                            <li>{t('emergency.content.dokumente.documentFolderContents.original.b1')}</li>
                        </ul>
                        <p><strong>{t('emergency.content.dokumente.documentFolderContents.titles.originalOrCertified')}</strong></p>
                        <ul>
                            <li>{t('emergency.content.dokumente.documentFolderContents.originalOrCertified.b1')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.originalOrCertified.b2')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.originalOrCertified.b3')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.originalOrCertified.b4')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.originalOrCertified.b5')}</li>
                        </ul>
                        <p><strong>{t('emergency.content.dokumente.documentFolderContents.titles.copies')}</strong></p>
                        <ul>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b1')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b2')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b3')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b4')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b5')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b6')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b7')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b8')}</li>
                            <li>{t('emergency.content.dokumente.documentFolderContents.copies.b9')}</li>
                        </ul>
                    </div>

                    {/* Abschnitt: Tipps zur Aktualisierung & Sicherung */}
                    <div id="tipps">
                        <h4>{t('emergency.sections.updateAndSecure')}</h4>
                        <ul>
                            <li>{t('emergency.content.dokumente.updateAndSecure.b1')}</li>
                            <li>{t('emergency.content.dokumente.updateAndSecure.b2')}</li>
                            <li>{t('emergency.content.dokumente.updateAndSecure.b3')}</li>
                            <li>{t('emergency.content.dokumente.updateAndSecure.b4')}</li>
                        </ul>
                    </div>
                </>
            ),
        },
        hygiene: {
            title: t('emergency.titles.hygiene'),
            image: "/hygiene.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#vorsorgen">{t('emergency.sections.hygienePrepare')}</a></li>
                            <li><a href="#tun">{t('emergency.sections.hygieneActions')}</a></li>
                            <li><a href="#vorratHygiene">{t('emergency.sections.hygieneStock')}</a></li>
                        </ul>
                    </div>

                    {/* Abschnitt: Vorsorgen für Notsituationen */}
                    <div id="vorsorgen">
                        <h4>{t('emergency.sections.hygienePrepare')}</h4>
                        <p>{t('emergency.content.hygiene.prepare.p1')}</p>
                    </div>

                    {/* Abschnitt: Das können Sie tun */}
                    <div id="tun">
                        <h4>{t('emergency.sections.hygieneActions')}</h4>
                        <p>{t('emergency.content.hygiene.actions.intro')}</p>
                        <ul>
                            <li>{t('emergency.content.hygiene.actions.b1')}</li>
                            <li>{t('emergency.content.hygiene.actions.b2')}</li>
                            <li>{t('emergency.content.hygiene.actions.b3')}</li>
                            <li>{t('emergency.content.hygiene.actions.b4')}</li>
                            <li>{t('emergency.content.hygiene.actions.b5')}</li>
                            <li>{t('emergency.content.hygiene.actions.b6')}</li>
                            <li>{t('emergency.content.hygiene.actions.b7')}</li>
                            <li>{t('emergency.content.hygiene.actions.b8')}</li>
                        </ul>
                    </div>

                    {/* Abschnitt: Das sollten Sie vorrätig haben */}
                    <div id="vorratHygiene">
                        <h4>{t('emergency.sections.hygieneStock')}</h4>
                        <p>{t('emergency.content.hygiene.stock.intro')}</p>
                        <ul>
                            <li>{t('emergency.content.hygiene.stock.b1')}</li>
                            <li>{t('emergency.content.hygiene.stock.b2')}</li>
                            <li>{t('emergency.content.hygiene.stock.b3')}</li>
                            <li>{t('emergency.content.hygiene.stock.b4')}</li>
                            <li>{t('emergency.content.hygiene.stock.b5')}</li>
                            <li>{t('emergency.content.hygiene.stock.b6')}</li>
                            <li>{t('emergency.content.hygiene.stock.b7')}</li>
                            <li>{t('emergency.content.hygiene.stock.b8')}</li>
                            <li>{t('emergency.content.hygiene.stock.b9')}</li>
                            <li>{t('emergency.content.hygiene.stock.b10')}</li>
                            <li>{t('emergency.content.hygiene.stock.b11')}</li>
                            <li>{t('emergency.content.hygiene.stock.b12')}</li>
                        </ul>
                        <p>{t('emergency.content.hygiene.stock.outro')}</p>
                    </div>

                </>
            ),
        },
        informieren: {
            title: t('emergency.titles.informieren'),
            image: "/informieren.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#warumInfo">{t('emergency.sections.whyEquipment')}</a></li>
                            <li><a href="#geraeteInfo">{t('emergency.sections.emergencyDevices')}</a></li>
                            <li><a href="#kommunikation">{t('emergency.sections.communication')}</a></li>
                            <li><a href="#funkRadio">{t('emergency.sections.radioFrequencies')}</a></li>
                            <li><a href="#tippsInfo">{t('emergency.sections.tipsTricks')}</a></li>
                        </ul>
                    </div>

                    {/* Abschnitt: Warum Notfallausrüstung? */}
                    <div id="warumInfo">
                        <h4>{t('emergency.sections.whyEquipment')}</h4>
                        <p>{t('emergency.content.informieren.whyEquipment.p1')}</p>
                    </div>

                    {/* Abschnitt: Notfallgeräte */}
                    <div id="geraeteInfo">
                        <h4>{t('emergency.sections.emergencyDevices')}</h4>
                        <p>{t('emergency.content.informieren.emergencyDevices.intro')}</p>
                        <ul>
                            <li>{t('emergency.content.informieren.emergencyDevices.b1')}</li>
                            <li>{t('emergency.content.informieren.emergencyDevices.b2')}</li>
                            <li>{t('emergency.content.informieren.emergencyDevices.b3')}</li>
                            <li>{t('emergency.content.informieren.emergencyDevices.b4')}</li>
                            <li>{t('emergency.content.informieren.emergencyDevices.b5')}</li>
                        </ul>
                    </div>

                    {/* Abschnitt: Kommunikationsmittel */}
                    <div id="kommunikation">
                        <h4>{t('emergency.sections.communication')}</h4>
                        <p>{t('emergency.content.informieren.communication.p1')}</p>
                        <ul>
                            <li>{t('emergency.content.informieren.communication.b1')}</li>
                            <li>{t('emergency.content.informieren.communication.b2')}</li>
                            <li>{t('emergency.content.informieren.communication.b3')}</li>
                            <li>{t('emergency.content.informieren.communication.b4')}</li>
                            <li>{t('emergency.content.informieren.communication.b5')}</li>
                        </ul>
                    </div>

                    {/* Neuer Abschnitt: Funk & Radio Frequenzen */}
                    <div id="funkRadio">
                        <h4>{t('emergency.sections.radioFrequencies')}</h4>
                        <p>{t('emergency.content.informieren.radioFrequencies.p1')}</p>
                        <p>{t('emergency.content.informieren.radioFrequencies.p2')}</p>
                        <p>{t('emergency.content.informieren.radioFrequencies.p3')}</p>
                        <p>{t('emergency.content.informieren.radioFrequencies.p4')}</p>
                        <ul>
                            <li>{t('emergency.content.informieren.radioFrequencies.b1')}</li>
                            <li>{t('emergency.content.informieren.radioFrequencies.b2')}</li>
                            <li>{t('emergency.content.informieren.radioFrequencies.b3')}</li>
                        </ul>
                    </div>

                    {/* Abschnitt: Tipps und Tricks */}
                    <div id="tippsInfo">
                        <h4>{t('emergency.sections.tipsTricks')}</h4>
                        <ul>
                            <li>{t('emergency.content.informieren.tipsTricks.b1')}</li>
                            <li>{t('emergency.content.informieren.tipsTricks.b2')}</li>
                            <li>{t('emergency.content.informieren.tipsTricks.b3')}</li>
                        </ul>
                    </div>
                </>
            ),
        },
        gepaeck: {
            title: t('emergency.titles.gepaeck'),
            image: "/gepaeck.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#warumGepaeck">{t('emergency.sections.whyBackpack')}</a></li>
                            <li><a href="#wannGepaeck">{t('emergency.sections.whenBackpack')}</a></li>
                            <li><a href="#rucksackwahl">{t('emergency.sections.backpackChoice')}</a></li>
                            <li><a href="#inhaltGepaeck">{t('emergency.sections.backpackContents')}</a></li>
                            <li><a href="#system">{t('emergency.sections.backpackSystem')}</a></li>
                            <li><a href="#packlisten">{t('emergency.sections.packingLists')}</a></li>
                            <li><a href="#tippsGepaeck">{t('emergency.sections.prepTips')}</a></li>
                            <li><a href="#lagerung">{t('emergency.sections.storagePlace')}</a></li>
                            <li><a href="#fertige">{t('emergency.sections.readyKitsAvailable')}</a></li>
                        </ul>
                    </div>

                    {/* Warum Fluchtrucksack? */}
                    <div id="warumGepaeck">
                        <h4>{t('emergency.sections.whyBackpack')}</h4>
                        <p>{t('emergency.content.gepaeck.whyBackpack.p1')}</p>
                        <p>{t('emergency.content.gepaeck.whyBackpack.p2')}</p>
                    </div>

                    <div id="wannGepaeck">
                        <h4>{t('emergency.sections.whenBackpack')}</h4>
                        <p>{t('emergency.content.gepaeck.whenBackpack.intro')}</p>
                        <ul>
                            <li>{t('emergency.content.gepaeck.whenBackpack.b1')}</li>
                            <li>{t('emergency.content.gepaeck.whenBackpack.b2')}</li>
                            <li>{t('emergency.content.gepaeck.whenBackpack.b3')}</li>
                            <li>{t('emergency.content.gepaeck.whenBackpack.b4')}</li>
                        </ul>
                    </div>

                    <div id="rucksackwahl">
                        <h4>{t('emergency.sections.backpackChoice')}</h4>
                        <p>{t('emergency.content.gepaeck.backpackChoice.p1')}</p>
                        <p>{t('emergency.content.gepaeck.backpackChoice.p2Intro')}</p>
                        <ul>
                            <li><b>{t('emergency.content.gepaeck.backpackChoice.types.molle.title')}</b> {t('emergency.content.gepaeck.backpackChoice.types.molle.desc')}</li>
                            <li><b>{t('emergency.content.gepaeck.backpackChoice.types.trekking.title')}</b> {t('emergency.content.gepaeck.backpackChoice.types.trekking.desc')}</li>
                            <li><b>{t('emergency.content.gepaeck.backpackChoice.types.ultra.title')}</b> {t('emergency.content.gepaeck.backpackChoice.types.ultra.desc')}</li>
                        </ul>
                    </div>

                    <div id="inhaltGepaeck">
                        <h4>{t('emergency.sections.backpackContents')}</h4>
                        <p>{t('emergency.content.gepaeck.backpackContents.intro')}</p>
                        <h5>{t('emergency.content.gepaeck.backpackContents.adult.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.gepaeck.backpackContents.adult.items.b1')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.adult.items.b2')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.adult.items.b3')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.adult.items.b4')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.adult.items.b5')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.adult.items.b6')}</li>
                        </ul>
                        <h5>{t('emergency.content.gepaeck.backpackContents.child.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.gepaeck.backpackContents.child.items.b1')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.child.items.b2')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.child.items.b3')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.child.items.b4')}</li>
                        </ul>
                        <p>{t('emergency.content.gepaeck.backpackContents.child.weightWarning')}</p>
                        <table className={style.fullWidthTable}>
                            <thead>
                                <tr>
                                    <th>{t('emergency.content.gepaeck.backpackContents.table.headings.age')}</th>
                                    <th>{t('emergency.content.gepaeck.backpackContents.table.headings.volume')}</th>
                                    <th>{t('emergency.content.gepaeck.backpackContents.table.headings.maxWeight')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r1.age')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r1.volume')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r1.weight')}</td>
                                </tr>
                                <tr>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r2.age')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r2.volume')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r2.weight')}</td>
                                </tr>
                                <tr>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r3.age')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r3.volume')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r3.weight')}</td>
                                </tr>
                                <tr>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r4.age')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r4.volume')}</td>
                                    <td>{t('emergency.content.gepaeck.backpackContents.table.rows.r4.weight')}</td>
                                </tr>
                            </tbody>
                        </table>
                        <h5>{t('emergency.content.gepaeck.backpackContents.baby.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.gepaeck.backpackContents.baby.items.b1')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.baby.items.b2')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.baby.items.b3')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.baby.items.b4')}</li>
                        </ul>
                        <h5>{t('emergency.content.gepaeck.backpackContents.pet.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.gepaeck.backpackContents.pet.items.b1')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.pet.items.b2')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.pet.items.b3')}</li>
                            <li>{t('emergency.content.gepaeck.backpackContents.pet.items.b4')}</li>
                        </ul>
                    </div>

                    <div id="system">
                        <h4>{t('emergency.sections.backpackSystem')}</h4>
                        <p>{t('emergency.content.gepaeck.system.intro')}</p>
                        <ul>
                            <li>
                                <b>{t('emergency.content.gepaeck.system.lvl1.title')}:</b> {t('emergency.content.gepaeck.system.lvl1.desc')}
                            </li>
                            <li>
                                <b>{t('emergency.content.gepaeck.system.lvl2.title')}:</b> {t('emergency.content.gepaeck.system.lvl2.desc')}
                            </li>
                            <li>
                                <b>{t('emergency.content.gepaeck.system.lvl3.title')}:</b> {t('emergency.content.gepaeck.system.lvl3.desc')}
                            </li>
                        </ul>
                    </div>

                    {/* Packlisten in einem Collapse – hier sind die Abschnitte zusammenklappbar */}
                    <div id="packlisten">
                        <h4>{t('emergency.sections.packingLists')}</h4>
                        <Collapse accordion>
                            <Panel header={t('emergency.content.gepaeck.packlists.panelHeaders.notgepaeck')} key="notgepaeck">
                                <h5>{t('emergency.content.gepaeck.packlists.groups.warmClothes')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.notgepaeck.warmClothes', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.food')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.notgepaeck.food', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.hygieneFirstAid')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.notgepaeck.hygieneFirstAid', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.otherEquipment')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.notgepaeck.otherEquipment', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </Panel>
                            <Panel header={t('emergency.content.gepaeck.packlists.panelHeaders.bugout')} key="bugout">
                                <h5>{t('emergency.content.gepaeck.packlists.groups.sleepShelter')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.bugout.sleepShelter', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.food')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.bugout.food', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.clothing')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.bugout.clothing', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.hygieneFirstAid')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.bugout.hygieneFirstAid', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.otherEquipment')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.bugout.otherEquipment', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </Panel>
                            <Panel header={t('emergency.content.gepaeck.packlists.panelHeaders.inchBag')} key="inchBag">
                                <h5>{t('emergency.content.gepaeck.packlists.groups.sleepShelter')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.inchBag.sleepShelter', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.food')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.inchBag.food', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.clothing')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.inchBag.clothing', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.hygieneFirstAid')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.inchBag.hygieneFirstAid', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.tools')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.inchBag.tools', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <h5>{t('emergency.content.gepaeck.packlists.groups.otherEquipment')}:</h5>
                                <ul>
                                    {(t('emergency.content.gepaeck.packlists.inchBag.otherEquipment', { returnObjects: true }) as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </Panel>
                        </Collapse>
                    </div>

                    <div id="tippsGepaeck">
                        <h4>{t('emergency.sections.prepTips')}</h4>
                        <ul>
                            <li>{t('emergency.content.gepaeck.tips.b1')}</li>
                            <li>{t('emergency.content.gepaeck.tips.b2')}</li>
                            <li>{t('emergency.content.gepaeck.tips.b3')}</li>
                            <li>{t('emergency.content.gepaeck.tips.b4')}</li>
                        </ul>
                    </div>

                    <div id="lagerung">
                        <h4>{t('emergency.sections.storagePlace')}</h4>
                        <p>{t('emergency.content.gepaeck.storagePlace.p1')}</p>
                    </div>

                    <div id="fertige">
                        <h4>{t('emergency.sections.readyKitsAvailable')}</h4>
                        <p>{t('emergency.content.gepaeck.readyKitsAvailable.p1')}</p>
                    </div>
                </>
            ),
        },


        sicherheit: {
            title: t('emergency.titles.sicherheit'),
            image: "/sicherheit.png",
            content: (
                <>
                    {/* Inhaltsverzeichnis */}
                    <div>
                        <h3>{t('emergency.toc')}</h3>
                        <ul>
                            <li><a href="#warumSicherheit">{t('emergency.sections.safetyWhyHome')}</a></li>
                            <li><a href="#bauTechnik">{t('emergency.sections.safetyMeasures')}</a></li>
                            <li><a href="#tippsSicherheit">{t('emergency.sections.safetyMaintenanceEvac')}</a></li>
                        </ul>
                    </div>

                    {/* Abschnitt: Warum Sicherheit im Haus? */}
                    <div id="warumSicherheit">
                        <h4>{t('emergency.sections.safetyWhyHome')}</h4>
                        <p>{t('emergency.content.sicherheit.why.p1')}</p>
                    </div>

                    {/* Abschnitt: Bauliche & technische Maßnahmen */}
                    <div id="bauTechnik">
                        <h4>{t('emergency.sections.safetyMeasures')}</h4>
                        <p>{t('emergency.content.sicherheit.measures.intro')}</p>

                        <h5>{t('emergency.content.sicherheit.measures.roof.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.sicherheit.measures.roof.items.b1')}</li>
                            <li>{t('emergency.content.sicherheit.measures.roof.items.b2')}</li>
                            <li>{t('emergency.content.sicherheit.measures.roof.items.b3')}</li>
                            <li>{t('emergency.content.sicherheit.measures.roof.items.b4')}</li>
                        </ul>

                        <h5>{t('emergency.content.sicherheit.measures.garden.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.sicherheit.measures.garden.items.b1')}</li>
                            <li>{t('emergency.content.sicherheit.measures.garden.items.b2')}</li>
                        </ul>

                        <h5>{t('emergency.content.sicherheit.measures.wastewater.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.sicherheit.measures.wastewater.items.b1')}</li>
                            <li>{t('emergency.content.sicherheit.measures.wastewater.items.b2')}</li>
                            <li>{t('emergency.content.sicherheit.measures.wastewater.items.b3')}</li>
                        </ul>

                        <h5>{t('emergency.content.sicherheit.measures.electrical.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.sicherheit.measures.electrical.items.b1')}</li>
                            <li>{t('emergency.content.sicherheit.measures.electrical.items.b2')}</li>
                            <li>{t('emergency.content.sicherheit.measures.electrical.items.b3')}</li>
                        </ul>

                        <h5>{t('emergency.content.sicherheit.measures.heating.title')}</h5>
                        <ul>
                            <li>{t('emergency.content.sicherheit.measures.heating.items.b1')}</li>
                            <li>{t('emergency.content.sicherheit.measures.heating.items.b2')}</li>
                        </ul>

                        <div className={style.alert}>
                            <Alert
                                message={t('emergency.content.sicherheit.alert.title')}
                                description={
                                    <p>
                                        {t('emergency.content.sicherheit.alert.descPre')}
                                        <a href="https://geoportal.bafg.de" target="_blank" rel="noopener noreferrer">
                                            {t('emergency.content.sicherheit.alert.linkLabel')}
                                        </a>
                                        {t('emergency.content.sicherheit.alert.descPost')}
                                    </p>
                                }
                                type="warning"
                                showIcon
                            />
                        </div>
                    </div>

                    {/* Abschnitt: Tipps zur Wartung & Evakuierungsplanung */}
                    <div id="tippsSicherheit">
                        <h4>{t('emergency.sections.safetyMaintenanceEvac')}</h4>
                        <ul>
                            <li>{t('emergency.content.sicherheit.tips.b1')}</li>
                            <li>{t('emergency.content.sicherheit.tips.b2')}</li>
                            <li>{t('emergency.content.sicherheit.tips.b3')}</li>
                            <li>{t('emergency.content.sicherheit.tips.b4')}</li>
                        </ul>
                    </div>
                </>
            ),
        },
        beduerfnisse: {
            title: t('emergency.titles.beduerfnisse'),
            image: "/beduerfnisse.png",
            content: (
                <>
                    <p>{t('emergency.content.beduerfnisse.intro.p1')}</p>
                    <p>
                        <strong>{t('emergency.content.beduerfnisse.tips.title')}</strong>
                        <ul>
                            <li>{t('emergency.content.beduerfnisse.tips.b1')}</li>
                            <li>{t('emergency.content.beduerfnisse.tips.b2')}</li>
                            <li>{t('emergency.content.beduerfnisse.tips.b3')}</li>
                            <li>{t('emergency.content.beduerfnisse.tips.b4')}</li>
                        </ul>
                    </p>
                    <p>{t('emergency.content.beduerfnisse.outro.p1')}</p>
                </>
            ),
        },
    };
}

export default function NotfallDetail() {
    const { t } = useTranslation();
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const contentMap = getDetailsContent(t);
    const detail = contentMap[category || "lebensmittel"] || {
        title: t('breadcrumb.emergency'),
        image: "",
        content: t('detail.noIdError'),
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
                onClick={() => navigate(homeRoute)}
                style={{ marginBottom: "16px" }}
            >
                {t('detail.buttons.back')}
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
