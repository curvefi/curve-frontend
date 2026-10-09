import { BigNumber } from 'bignumber.js'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { addQueryString, fetchJson } from '@primitives/fetch.utils'
import type { RouterRouteResponse, TransactionData } from '@primitives/router.utils'

export type MigrationRouteParams = {
  chainId: number
  userAddress: Address
  tokenIn: Address
  tokenOut: Address
  /** Raw token units. */
  amountIn: Decimal
  /** Percent. */
  slippage: Decimal
}

/** `minAmountOut` is in raw token units. */
export type MigrationRoute = Omit<RouterRouteResponse, 'tx'> & { tx: TransactionData; minAmountOut: Decimal }

/**
 * Enso route through our router API, which holds the Enso key and adds the flat migration fee (no LlamaLend controller).
 * The user is the Enso `fromAddress`, approving and calling the Enso router (`tx.to`) directly.
 */
export async function fetchMigrationRoute({
  chainId,
  userAddress,
  tokenIn,
  tokenOut,
  amountIn,
  slippage,
}: MigrationRouteParams): Promise<MigrationRoute> {
  const [route] = await fetchJson<RouterRouteResponse[]>(
    `/api/router/v1/routes${addQueryString({ chainId, router: 'enso', tokenIn, tokenOut, amountIn, zapAddress: userAddress, slippage })}`,
  )
  if (!route?.tx) throw new Error('No Enso route found')
  // The router API drops Enso's minAmountOut; the calldata still enforces it, so this mirrors it for display.
  const minAmountOut = new BigNumber(route.amountOut[0])
    .times(new BigNumber(100).minus(slippage))
    .div(100)
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed() as Decimal
  return { ...route, tx: route.tx, minAmountOut }
}
