import { BigNumber } from 'bignumber.js'
import Chip from '@mui/material/Chip'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'
import { formatPercent } from '@ui-kit/utils/number'

const showPercentage = (toAmountOutput: Decimal, bestOutputAmount: Decimal) =>
  formatPercent(BigNumber(toAmountOutput).minus(bestOutputAmount).div(bestOutputAmount).div(100).toFixed() as Decimal)

export const RouteComparisonChip = ({
  maxAmountOut,
  amountOut,
}: {
  maxAmountOut: Decimal | undefined
  amountOut: Decimal[]
}) => (
  <Chip
    {...(maxAmountOut &&
      (amountOut.includes(maxAmountOut)
        ? { 'aria-label': t`Best price`, label: t`Best price`, color: 'active' }
        : {
            'aria-label': t`Price difference`,
            label: showPercentage(amountOut[0], maxAmountOut),
            color: 'alert',
          }))}
    size="extraSmall"
  />
)
