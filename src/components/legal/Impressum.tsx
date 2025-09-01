import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function Impressum() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
      <Title level={2}>Impressum</Title>
      <Paragraph>
        Angaben gemäß § 5 TMG. Dies ist eine Beispielseite. Bitte ergänzen Sie Ihre rechtlich
        korrekten Impressumsangaben (Anschrift, Vertretungsberechtigter, Kontakt, ggf. Registerangaben, USt-IdNr.).
      </Paragraph>
      <Title level={3}>Kontakt</Title>
      <Paragraph>
        E-Mail: kontakt@example.com
      </Paragraph>
      <Title level={3}>Haftungsausschluss</Title>
      <Paragraph>
        Die Inhalte dieser App wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
        und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
      </Paragraph>
    </div>
  );
}
