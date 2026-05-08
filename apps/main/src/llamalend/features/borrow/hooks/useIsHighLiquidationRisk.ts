import { useCreateLoanPrices } from '@/llamalend/queries/create-loan/create-loan-prices.query'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { combineQueryState } from '@ui-kit/lib'
import { decimalDiv, decimalGreaterThan } from '@ui-kit/utils'
import type { CreateLoanFormQueryParams } from '../types'

/**
 * When the upper end of the liquidation range is this percentage of the oracle price,
 * it means the user is very close to entering soft-liquidation right from the start.
 * @example: Oracle price is $10 and the soft-liquidation starts at $9.5
 */
const RANGE_PROXIMITY = '0.95'

export const useIsHighLiquidationRisk = (params: CreateLoanFormQueryParams) => {
  const oraclePrice = useMarketOraclePrice(params)
  const prices = useCreateLoanPrices(params)

  return {
    data:
      oraclePrice.data &&
      prices.data?.[1] &&
      decimalGreaterThan(decimalDiv(prices.data?.[1], oraclePrice.data), RANGE_PROXIMITY),
    ...combineQueryState(oraclePrice, prices),
  }
}
