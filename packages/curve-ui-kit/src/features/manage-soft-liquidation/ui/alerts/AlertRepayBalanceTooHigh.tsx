import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Props = {
  symbol: string
  input: number
  userBalance: number | undefined
  debt: number | undefined
}

export const AlertRepayBalanceTooHigh = ({ symbol, input, userBalance, debt }: Props) => {
  const showBalanceMessage = userBalance != null && input > userBalance
  const showDebtMessage = debt != null && input > debt
  const showAnyMessage = showBalanceMessage || showDebtMessage

  if (!showAnyMessage) return null

  return (
    <Alert severity="error" variant="outlined" sx={{ boxShadow: 'none' }}>
      <AlertTitle>{t`Repay amount too large`}</AlertTitle>

      <Stack gap={Spacing.sm}>
        {showBalanceMessage && (
          <Typography variant="bodySRegular" color="textSecondary">
            {t`You're trying to repay ${input} `}
            <strong>{symbol}</strong>
            {t`, but your wallet only contains ${userBalance} `}
            <strong>{symbol}</strong>
            {t`. Please enter a smaller amount.`}
          </Typography>
        )}

        {showDebtMessage && !showBalanceMessage && (
          <Typography variant="bodySRegular" color="textSecondary">
            {t`You're trying to repay ${input} `}
            <strong>{symbol}</strong>
            {t`, but you only owe ${debt} `}
            <strong>{symbol}</strong>
          </Typography>
        )}
      </Stack>
    </Alert>
  )
}
