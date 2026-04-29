import { BigNumber } from 'bignumber.js'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { Badge } from '@ui-kit/shared/ui/Badge'
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
  <Badge
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
