import Chip from '@mui/material/Chip'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import type { Decimal } from '@ui-kit/utils/decimal'
import { formatPercent } from '@ui-kit/utils/number'

const showPercentage = (toAmountOutput: Decimal, bestOutputAmount: Decimal) =>
  formatPercent(((parseFloat(toAmountOutput) - Number(bestOutputAmount)) / Number(bestOutputAmount)) * 100)

export const RouteComparisonChip = ({
  bestOutputAmount,
  toAmountOutput,
  isLoading,
}: {
  bestOutputAmount: Decimal | undefined
  toAmountOutput: Decimal
  isLoading: boolean
}) => (
  <WithSkeleton loading={isLoading}>
    <Chip
      {...(bestOutputAmount &&
        (toAmountOutput === bestOutputAmount
          ? { 'aria-label': t`Best price`, label: t`Best price`, color: 'active' }
          : {
              'aria-label': t`Price difference`,
              label: showPercentage(toAmountOutput, bestOutputAmount),
              color: 'alert',
            }))}
      size="extraSmall"
    />
  </WithSkeleton>
)
