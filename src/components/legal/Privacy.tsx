import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function Privacy() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
      <Title level={2}>Datenschutzerklärung</Title>
      <Paragraph>
        Hier finden Sie Informationen zur Verarbeitung Ihrer personenbezogenen Daten in dieser App.
        Bitte ergänzen Sie diese Vorlage mit den für Ihre App erforderlichen Angaben (Verarbeitungszwecke,
        Rechtsgrundlagen, Speicherdauer, Empfänger, Rechte der Betroffenen, Kontakt Datenschutz, etc.).
      </Paragraph>
      <Title level={3}>Kontakt für Datenschutzanfragen</Title>
      <Paragraph>
        E-Mail: privacy@example.com
      </Paragraph>
    </div>
  );
}
