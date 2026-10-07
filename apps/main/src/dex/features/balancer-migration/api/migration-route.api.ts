import type { Address } from '@primitives/address.utils'
import { addQueryString, fetchJson } from '@primitives/fetch.utils'
import type { RouterRouteResponse, TransactionData } from '@primitives/router.utils'

export type MigrationRouteParams = {
  chainId: number
  userAddress: Address
  tokenIn: Address
  tokenOut: Address
  /** Raw token units. */
  amountIn: bigint
  /** Basis points. */
  slippageBps: number
}

export type MigrationRoute = Omit<RouterRouteResponse, 'tx'> & { tx: TransactionData; minAmountOut: string }

/**
 * Enso route through our router API, which holds the Enso key. With no LlamaLend controller the router API adds no fee.
 * The user is the Enso `fromAddress`, approving and calling the Enso router (`tx.to`) directly.
 */
export async function fetchMigrationRoute({
  chainId,
  userAddress,
  tokenIn,
  tokenOut,
  amountIn,
  slippageBps,
}: MigrationRouteParams): Promise<MigrationRoute> {
  const [route] = await fetchJson<RouterRouteResponse[]>(
    `/api/router/v1/routes${addQueryString({
      chainId,
      router: 'enso',
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      zapAddress: userAddress,
      slippage: slippageBps / 100, // router API takes percent
    })}`,
  )
  if (!route?.tx) throw new Error('No Enso route found')
  // The router API drops Enso's minAmountOut; the calldata still enforces it, so this mirrors it for display.
  const minAmountOut = (BigInt(route.amountOut[0]) * BigInt(10_000 - slippageBps)) / 10_000n
  return { ...route, tx: route.tx, minAmountOut: minAmountOut.toString() }
}
