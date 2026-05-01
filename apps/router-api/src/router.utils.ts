import { BigNumber } from 'bignumber.js'
import { formatUnits, parseUnits } from 'viem'
import { toArray } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouterRouteResponse } from '@primitives/router.utils'
import type { RoutesQuery } from './routes/routes.schemas'

/**
 * Returns the maximum Decimal value from an array of Decimals, without losing precision.
 */
export const decimalMax = (...data: Decimal[]): Decimal | undefined =>
  data.reduce<Decimal | undefined>(
    (max, value) => (max == null ? value : new BigNumber(value).isGreaterThan(max) ? value : max),
    undefined,
  )

export const toWei = (n: string, decimals: number) => parseUnits(n, decimals).toString() as Decimal
export const fromWei = (n: string, decimals: number) => formatUnits(BigInt(n), decimals) as Decimal
export const decimalCompare = (a: Decimal, b: Decimal) => BigNumber(a).comparedTo(b) ?? 0

const hashString = async (input: string, algorithm = 'SHA-256') =>
  Array.from(new Uint8Array(await crypto.subtle.digest(algorithm, new TextEncoder().encode(input))))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

/**
 * The ID generated here aims to be stable for the same route parameters, so it can be used for caching and identifying
 * routes across the app.
 */
export const generateId = async (
  { chainId, tokenIn, tokenOut, amountIn, userAddress, slippage = 0.5 }: RoutesQuery,
  { router }: RouterRouteResponse, // todo: support multiple routeIds per provider
) =>
  `${router}:${await hashString(
    [chainId, tokenIn, tokenOut, amountIn, slippage, userAddress]
      .map(v => toArray<number | string>(v).join(','))
      .join('-'),
  )}`
