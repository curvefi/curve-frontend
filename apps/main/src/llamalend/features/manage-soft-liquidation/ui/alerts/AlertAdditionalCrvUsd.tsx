import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { t, Trans } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatTokens } from '../action-infos/util'

const { Spacing } = SizesAndSpaces

type Props = {
  debtTokenSymbol: string
  missing: Decimal
  balance: Decimal
}

export const AlertAdditionalCrvUsd = ({ missing, debtTokenSymbol, balance }: Props) => (
  <Alert severity="error" variant="outlined" sx={{ boxShadow: 'none' }}>
    <AlertTitle>{t`Additional crvUSD required`}</AlertTitle>

    <Stack gap={Spacing.sm}>
      <Typography variant="bodySRegular" color="textSecondary">
        <Trans>
          Your position cannot be closed because the outstanding debt amount is greater than the available collateral
          value. Additionally, your wallet does not contain sufficient <strong>{debtTokenSymbol}</strong> tokens to
          cover the remaining debt balance that exceeds your collateral.
        </Trans>
      </Typography>

      <Typography variant="bodySRegular" color="textSecondary">
        <Trans>
          A minimum balance of <strong>{formatTokens({ symbol: debtTokenSymbol, amount: missing })}</strong> is required
          in your wallet to close the position
        </Trans>
        <Typography variant="bodyXsRegular" color="textTertiary" component="span">
          <Trans>
            (You currently have <strong>{formatTokens({ symbol: debtTokenSymbol, amount: balance })}</strong> in your
            wallet)
          </Trans>
        </Typography>
        .
      </Typography>
    </Stack>
  </Alert>
)
