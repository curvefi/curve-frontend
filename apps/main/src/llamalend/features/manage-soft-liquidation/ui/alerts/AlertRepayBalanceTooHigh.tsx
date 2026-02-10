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
  symbol: string
  input: Decimal
  userBalance: Decimal | undefined
  debt: Decimal | undefined
}

export const AlertRepayBalanceTooHigh = ({ symbol, input, userBalance, debt }: Props) => {
  const showBalanceMessage = userBalance != null && +input > +userBalance
  const showDebtMessage = debt != null && +input > +debt
  const showAnyMessage = showBalanceMessage || showDebtMessage

  if (!showAnyMessage) return null

  return (
    <Alert severity="error" variant="outlined" sx={{ boxShadow: 'none' }}>
      <AlertTitle>{t`Repay amount too large`}</AlertTitle>

      <Stack gap={Spacing.sm}>
        {showBalanceMessage && (
          <Typography variant="bodySRegular" color="textSecondary">
            {t`You're trying to repay `}
            <strong>{formatTokens({ symbol, amount: input })}</strong>
            {t`, but your wallet merely contains `}
            <strong>{userBalance && formatTokens({ symbol, amount: userBalance })}</strong>
            {t`. Please enter a smaller amount.`}
          </Typography>
        )}

        {showDebtMessage && !showBalanceMessage && (
          <Typography variant="bodySRegular" color="textSecondary">
            {t`You're trying to repay `}
            <strong>{formatTokens({ symbol, amount: input })}</strong>
            {t`, but you only owe `}
            <strong>{debt && formatTokens({ symbol, amount: debt })}</strong>
          </Typography>
        )}
      </Stack>
    </Alert>
  )
}
