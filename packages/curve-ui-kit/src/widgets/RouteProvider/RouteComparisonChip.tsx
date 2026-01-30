import Chip from '@mui/material/Chip'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { type Decimal, formatPercent } from '@ui-kit/utils'

const showPercentage = (toAmountOutput: Decimal, bestPrice: Decimal) =>
  formatPercent(((parseFloat(toAmountOutput) - Number(bestPrice)) / Number(bestPrice)) * 100)

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
      // sx={{ border: 0 }} // this is displayed inside an accordion, so the
    />
  </WithSkeleton>
)
