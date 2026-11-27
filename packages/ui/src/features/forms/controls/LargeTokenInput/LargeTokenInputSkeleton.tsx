import Typography from '@mui/material/Typography'
import { noop } from '@tanstack/react-query'
import { Skeleton } from '@ui/components/Skeleton'
import { LargeTokenInput } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInput'
import { t } from '@ui/lib/i18n'

export const LargeTokenInputSkeleton = () => (
  <Skeleton category="content.fullWidth">
    <LargeTokenInput
      name="loading"
      onBalance={noop}
      label={t`Loading`}
      tokenSelector={<Typography variant="bodyMBold">{t`Token`}</Typography>}
      walletBalance={{ balance: '0', symbol: t`Token` }}
      inputBalanceUsd="0"
    />
  </Skeleton>
)
