import { useMemo } from 'react'
import { useMarketOraclePriceBand } from '@/llamalend/queries/market-oracle-price-band.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market-oracle-price.query'
import type { LiquidationRangeData } from '@/llamalend/widgets/ChartLiquidationRange'
import { t } from '@ui-kit/lib/i18n'
import { useCreateLoanPrices } from '../../../queries/create-loan/create-loan-prices.query'
import type { CreateLoanFormQueryParams } from '../types'

/**
 * Retrieves the liquidation range chart data for the create loan form.
 * Queries are always enabled since the data is used on the OHLC chart, even if the ChartLiquidationRange is invisible.
 */
export const useLiquidationRangeChartData = (params: CreateLoanFormQueryParams): LiquidationRangeData[] => {
  const { data: prices } = useCreateLoanPrices(params)
  const { data: oraclePrice } = useMarketOraclePrice(params)
  const { data: oraclePriceBand } = useMarketOraclePriceBand(params)
  return useMemo(
    () => [
      {
        name: t`Liquidation Range`,
        currLabel: '',
        curr: [0, 0], // Empty array for new borrow (no current position)
        new: prices?.map((n) => +n) ?? [0, 0],
        newLabel: 'LR',
        oraclePrice: oraclePrice ?? '',
        oraclePriceBand: oraclePriceBand ?? null,
      },
    ],
    [prices, oraclePrice, oraclePriceBand],
  )
}
