import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Decimal } from '@ui-kit/utils'
import { formatTokens } from '../action-infos/util'

const { Spacing } = SizesAndSpaces

type Props = {
  debtTokenSymbol: string
  missing: Decimal
}

export const AlertAdditionalCrvUsd = ({ missing, debtTokenSymbol }: Props) => (
  <Alert severity="error" variant="outlined" sx={{ boxShadow: 'none' }}>
    <AlertTitle>{t`Additional crvUSD required`}</AlertTitle>

    <Stack gap={Spacing.sm}>
      <Typography variant="bodySRegular" color="textSecondary">
        {t`Your position cannot be closed because the outstanding debt amount is greater than the available collateral value. Additionally, your wallet does not contain sufficient `}
        <strong>{debtTokenSymbol}</strong>
        {t` tokens to cover the remaining debt balance that exceeds your collateral.`}
      </Typography>

      <Typography variant="bodySRegular" color="textSecondary">
        {t`A minimum balance of `}
        <strong>{formatTokens({ symbol: debtTokenSymbol, amount: missing })}</strong>
        {t` is required in your wallet to close the position.`}
      </Typography>
    </Stack>
  </Alert>
)
