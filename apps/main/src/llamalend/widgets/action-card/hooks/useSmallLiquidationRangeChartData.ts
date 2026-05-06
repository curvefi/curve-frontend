import type { SmallLiquidationRangeChartProps } from '@/llamalend/widgets/small-liquidation-range-chart/SmallLiquidationRangeChart'
import type { Decimal } from '@primitives/decimal.utils'
import type { QueryProp, Range } from '@ui-kit/types/util'

type Params = {
  prices?: QueryProp<Range<Decimal> | null>
  prevPrices?: QueryProp<Range<Decimal>>
  oraclePrice?: QueryProp<Decimal | null>
  isFullRepay?: boolean
}

export const useSmallLiquidationRangeChartData = ({
  prices,
  prevPrices,
  oraclePrice,
  isFullRepay,
}: Params): SmallLiquidationRangeChartProps | undefined => {
  if (isFullRepay) return undefined

  const currentRange = prevPrices?.data
  const newRange = prices?.data ?? undefined
  const chartOraclePrice = oraclePrice?.data ?? undefined

  if (!currentRange && !newRange && chartOraclePrice == null) return undefined

  return {
    liquidationRanges: {
      ...(currentRange && { currentRange }),
      ...(newRange && { newRange }),
    },
    oraclePrice: chartOraclePrice,
  }
}
