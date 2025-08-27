import { Alert, Avatar, Collapse, Typography } from 'antd';
import React, { ReactElement } from 'react';
import style from './Home.module.css';
import LazyAvatar from './LazyAvatar';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const recommendations = [
    {
        key: 'lebensmittel',
        avatar: "/lebensmittel.png",
        placeholder: "/lebensmittel-small.png",
        link: "/details/lebensmittel"
    },
    {
        key: 'wasser',
        avatar: "/wasser.png",
        placeholder: "/wasser-small.png",
        link: "/details/wasser"
    },
    {
        key: 'medikamente',
        avatar: "/medikamente.png",
        placeholder: "/medikamente-small.png",
        link: "/details/medikamente"
    },
    {
        key: 'hygiene',
        avatar: "/hygiene.png",
        placeholder: "/hygiene-small.png",
        link: "/details/hygiene"
    },
    {
        key: 'informieren',
        avatar: "/informieren.png",
        placeholder: "/informieren-small.png",
        link: "/details/informieren"
    },
    {
        key: 'beduerfnisse',
        avatar: "/beduerfnisse.png",
        placeholder: "/beduerfnisse-small.png",
        link: "/details/beduerfnisse"
    },
    {
        key: 'dokumente',
        avatar: "/dokumente.png",
        placeholder: "/dokumente-small.png",
        link: "/details/dokumente"
    },
    {
        key: 'gepaeck',
        avatar: "/gepaeck.png",
        placeholder: "/gepaeck-small.png",
        link: "/details/gepaeck"
    },
    {
        key: 'sicherheit',
        avatar: "/sicherheit.png",
        placeholder: "/sicherheit-small.png",
        link: "/details/sicherheit"
    }
];

export default function Home(): ReactElement {
    const { t } = useTranslation();
    return (
        <div className={style.mycontainer}>
            <Title level={2}>{t('home.title')}</Title>
            <Paragraph>
                {t('home.intro')}
            </Paragraph>
            <Collapse defaultActiveKey={[]} accordion>
                {recommendations.map((item, index) => (
                    <Panel
                        header={
                            <div className={style.panelHeader}>
                                <LazyAvatar
                                    src={item.avatar}
                                    placeholderSrc={item.placeholder}
                                    size={64}
                                    className={style.avatar}
                                    alt={t(`home.recommendations.${item.key}.title`)}
                                />
                                <span className={style.paneltitle}>{t(`home.recommendations.${item.key}.title`)}</span>
                            </div>
                        }
                        key={index}
                    >
                        <Paragraph>{t(`home.recommendations.${item.key}.description`)}</Paragraph>
                        <Link to={item.link} className={style.moreInfoLink}>{t('home.moreInfo')}</Link>
                    </Panel>
                ))}
            </Collapse>
            <div className={style.infosection}>
                <Title level={4}>{t('home.info.title')}</Title>
                <Paragraph>
                    {t('home.info.guide.pre')}{' '}<a
                        href="https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/Buergerinformationen/Ratgeber/ratgeber-notfallvorsorge.pdf?__blob=publicationFile&v=32"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={style.inlineLink}
                    >
                        {t('home.info.guide.link')}
                    </a>{' '}
                    {t('home.info.guide.post')}
                </Paragraph>
                <Paragraph>
                    {t('home.info.checklist.pre')}{' '}
                    <a
                        href="https://www.bbk.bund.de/SharedDocs/Downloads/DE/Mediathek/Publikationen/Buergerinformationen/Ratgeber/ratgeber-notfallvosorge-checkliste.pdf?__blob=publicationFile&v=10"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={style.inlineLink}
                    >
                        {t('home.info.checklist.link')}
                    </a>{' '}
                    {t('home.info.checklist.post')}
                </Paragraph>
                <Paragraph>
                    {t('home.info.bbk.pre')}{' '}
                    <a
                        href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/vorsorge_node.html#:~:text=Wir%20empfehlen%20mindestens%20einen%20Vorrat,eine%20Woche%20bis%20zehn%20Tage."
                        target="_blank"
                        rel="noopener noreferrer"
                        className={style.inlineLink}
                    >
                        {t('home.info.bbk.link')}
                    </a>
                </Paragraph>
            </div>
            <Alert
                message={t('home.notice.title')}
                description={t('home.notice.desc')}
                type="info"
                showIcon
                className={style.alert}
            />
        </div>
    );
}