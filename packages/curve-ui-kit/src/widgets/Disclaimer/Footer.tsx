import { t } from '@lingui/macro'

import { Section, Header, Paragraph } from './Section'

export const Footer = () => (
  <>
    <Header>{t`Disclaimer`}</Header>
    <Section>
      <Paragraph>{t`The information provided within this context does not constitute financial, legal, or tax advice personalized to your specific circumstances. The content presented is for informational purposes only and should not be relied upon as a substitute for professional advice tailored to your individual needs. It is recommended that you seek the advice of qualified professionals regarding financial, legal, and tax matters before engaging in any activities on Curve.`}</Paragraph>
    </Section>
  </>
)
