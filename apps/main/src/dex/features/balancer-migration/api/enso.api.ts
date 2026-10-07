import type { Address, Hex } from '@primitives/address.utils'
import { addQueryString, fetchJson } from '@primitives/fetch.utils'

/** Proxied by the dev server and the edge worker, which add the Enso API key so it never ships to the browser. */
const ENSO_PROXY_URL = '/api/enso'

export type EnsoRouteParams = {
  chainId: number
  fromAddress: Address
  tokenIn: Address
  tokenOut: Address
  /** Raw token units. */
  amountIn: bigint
  /** Basis points. */
  slippageBps: number
}

/** Amounts are raw token unit strings. */
export type EnsoRoute = {
  amountOut: string
  minAmountOut: string
  /** Basis points, null when Enso has no USD price for a token. */
  priceImpact: number | null
  gas: string
  tx: { to: Address; from: Address; data: Hex; value: string }
  route: { action: string; protocol: string; tokenIn: Address[]; tokenOut: Address[] }[]
}

/**
 * `router` strategy: the user approves the Enso router (`tx.to`) and calls it directly,
 * so no Enso smart wallet is deployed for the user.
 */
export const fetchEnsoRoute = ({ chainId, fromAddress, tokenIn, tokenOut, amountIn, slippageBps }: EnsoRouteParams) =>
  fetchJson<EnsoRoute>(
    `${ENSO_PROXY_URL}/api/v1/shortcuts/route${addQueryString({
      chainId,
      fromAddress,
      receiver: fromAddress,
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      slippage: slippageBps,
      routingStrategy: 'router',
    })}`,
  )
