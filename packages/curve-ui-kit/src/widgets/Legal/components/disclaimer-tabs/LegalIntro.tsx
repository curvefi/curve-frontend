import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, PAGE_LEGAL } from '@ui-kit/shared/routes'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { pushSearchParams } from '@ui-kit/utils/urls'
import type { TabProps } from '../../types/tabs'
import { List } from '../general/List'
import { Paragraph } from '../general/Section'

export const LegalIntro = ({ currentApp, network }: TabProps) => (
  <>
    <Paragraph>
      {t`Use of this site and the Curve functionalities is subject to the`}{' '}
      <RouterLink
        color="textSecondary"
        href={getInternalUrl(currentApp, network, PAGE_LEGAL)}
        onClick={(e) => pushSearchParams(e, { tab: 'terms' })}
      >
        {t`Terms and Conditions`}
      </RouterLink>
      {t`. The term “Curve Functionalities” has the meaning given in the Terms and Conditions.`}
    </Paragraph>

    <Paragraph>
      <List type="disc">
        <Typography component="li" variant="bodyMRegular">
          {t`New technology risk: smart contracts and related software can fail.`}
        </Typography>

        <Typography component="li" variant="bodyMRegular">
          {t`Wallet security: you are solely responsible for your keys and wallet security.`}
        </Typography>

        <Typography component="li" variant="bodyMRegular">
          {t`Tax risk: you are responsible for any tax obligations.`}
        </Typography>

        <Typography component="li" variant="bodyMRegular">
          {t`No counterparty guarantee: no party guarantees performance of any market participant.`}
        </Typography>

        <Typography component="li" variant="bodyMRegular">
          {t`Regulatory risk: laws can change and impact access or use.`}
        </Typography>

        <Typography component="li" variant="bodyMRegular">
          {t`Limitation of liability: see the Terms and Conditions for limits on liability.`}
        </Typography>
      </List>
    </Paragraph>

    <Paragraph>{t`Swiss Stake AG does not operate any Curve Functionalities.`}</Paragraph>
  </>
)
