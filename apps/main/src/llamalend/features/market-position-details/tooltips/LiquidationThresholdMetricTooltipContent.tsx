import { useUserBands } from '@/llamalend/queries/user'
import { UNAVAILABLE_NOTATION } from '@/llamalend/widgets/tooltips/tooltip.utils'
import {
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
  TooltipDescription,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import type { UserMarketParams } from '@ui-kit/lib/model'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'

type LiquidationThresholdTooltipContentProps = {
  userPrices: QueryProp<Range<Decimal> | null>
  rangeToLiquidation: QueryProp<Decimal | null>
  params: UserMarketParams
}

export const LiquidationThresholdTooltipContent = ({
  userPrices: { data: liquidationRange },
  rangeToLiquidation: { data: rangeToLiquidation },
  params,
}: LiquidationThresholdTooltipContentProps) => {
  const { data: bandRange } = useUserBands(params)
  return (
    <TooltipWrapper>
      <TooltipDescription
        text={[
          t`The price at which your position enters the liquidation range  and your collateral starts to be eroded by LLAMMA.`,
          t`The distance to LT indicates how much the current price can drop before reaching the LT.`,
        ].join(' ')}
      />
      <TooltipItems secondary>
        <TooltipItem title={t`Distance to LT`} variant="independent">
          {rangeToLiquidation != null ? formatNumber(rangeToLiquidation, 'percent.value') : UNAVAILABLE_NOTATION}
        </TooltipItem>
        <TooltipItem title={t`Liquidation range`} variant="independent">
          {liquidationRange?.map(price => formatNumber(price, 'usd.amount')).join(' to ') ?? UNAVAILABLE_NOTATION}
        </TooltipItem>
        <TooltipItem title={t`Amount of bands`} variant="independent">
          {bandRange
            ? formatNumber(Math.abs(bandRange[0] - bandRange[1]), { abbreviate: false })
            : UNAVAILABLE_NOTATION}
        </TooltipItem>
        <TooltipItem title={t`Band range`} variant="independent">
          {bandRange ? `${bandRange[0]} to ${bandRange[1]}` : UNAVAILABLE_NOTATION}
        </TooltipItem>
      </TooltipItems>
    </TooltipWrapper>
  )
}
