import { useMemo } from 'react'
import type { LiquidationRangeData } from '@/llamalend/widgets/ChartLiquidationRange'
import { t } from '@ui-kit/lib/i18n'
import type { BorrowFormQueryParams } from '../borrow.types'
import { useBorrowOraclePriceBand } from '../queries/borrow-oracle-price-band.query'
import { useBorrowOraclePrice } from '../queries/borrow-oracle-price.query'
import { useBorrowPrices } from '../queries/borrow-prices.query'

/**
 * Retrieves the liquidation range chart data for the borrow form.
 * Queries are always enabled since the data is used on the OHLC chart, even if the ChartLiquidationRange is invisible.
 */
export const useLiquidationRangeChartData = (params: BorrowFormQueryParams): LiquidationRangeData[] => {
  const { data: prices } = useBorrowPrices(params)
  const { data: oraclePrice } = useBorrowOraclePrice(params)
  const { data: oraclePriceBand } = useBorrowOraclePriceBand(params)
  return useMemo(
    () => [
      {
        name: t`Liquidation Range`,
        currLabel: '',
        curr: [0, 0], // Empty array for new borrow (no current position)
        new: prices ?? [0, 0],
        newLabel: 'LR',
        oraclePrice: oraclePrice ?? '',
        oraclePriceBand: oraclePriceBand ?? null,
      },
    ],
    [prices, oraclePrice, oraclePriceBand],
  )
}
