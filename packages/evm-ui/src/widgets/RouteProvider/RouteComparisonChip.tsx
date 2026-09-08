import { BigNumber } from 'bignumber.js'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { formatNumber } from '@evm-ui/utils/number'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui/lib/i18n'

const showPercentage = (toAmountOutput: Decimal, bestOutputAmount: Decimal) =>
  formatNumber(
    BigNumber(toAmountOutput).minus(bestOutputAmount).div(bestOutputAmount).div(100).toFixed() as Decimal,
    'percent.rate',
  )

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
