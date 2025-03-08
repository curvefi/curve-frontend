'use server'
import memoizee from 'memoizee'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { Chain } from '@curvefi/prices-api'
import { getMarkets } from '@curvefi/prices-api/crvusd'

const getCrvUsdMarkets = memoizee(getMarkets, { promise: true, preFetch: true, maxAge: 1000 * 60 * 5 })

export async function getCollateralName({ network, collateralId }: CollateralUrlParams) {
  const markets = await getCrvUsdMarkets(network as Chain)
  return markets.find((m) => m.collateralToken.symbol.toLowerCase() === collateralId)?.name ?? collateralId
}
