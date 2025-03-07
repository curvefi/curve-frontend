'use server'
import { getMarkets } from '@curvefi/prices-api/crvusd'
import { Chain } from '@curvefi/prices-api'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import memoizee from 'memoizee'

const getCrvUsdMarkets = memoizee(getMarkets, { promise: true, preFetch: true, maxAge: 1000 * 60 * 5 })

export async function getCollateralName({ network, collateralId }: CollateralUrlParams) {
  const markets = await getCrvUsdMarkets(network as Chain)
  return markets.find((m) => m.collateralToken.symbol.toLowerCase() === collateralId)?.name ?? collateralId
}
