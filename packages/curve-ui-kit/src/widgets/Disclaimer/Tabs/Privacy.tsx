import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Section, Header, Title, Paragraph, Bold, SubTitle } from '../Section'
import { List } from '../List'
import { CurveNetworkId, LlamaNetworkId } from '@ui-kit/features/connect-wallet/lib/types'
import { AppName } from '@ui-kit/shared/routes'

export const Privacy = ({ currentApp, network }: { currentApp: AppName; network: CurveNetworkId | LlamaNetworkId }) => (
  <>
    <Header>{t`Privacy Policy`}</Header>
    <Section>
      <Paragraph></Paragraph>
    </Section>
  </>
)
