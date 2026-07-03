import { toArray } from '@primitives/array.utils'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils'
import type { TokenAmount } from './types'

/**
 * Formats collateral into a readable string representation.
 * Handles both single collateral objects and arrays of collateral.
 * For arrays, concatenates all entries with ' + ' separator.
 * Uses abbreviateNumber and scaleSuffix for compact number formatting.
 *
 * @param tokens - Single collateral object or array of collateral objects
 * @param decimals - Number of decimal places for formatting (default: 2)
 * @returns Formatted string combining all collateral values and symbols
 *
 * @example
 * formatTokens({ symbol: 'ETH', amount: 10.5 })
 * // Returns: "10.5 ETH"
 *
 * formatTokens({ symbol: 'USDC', amount: 1500000 })
 * // Returns: "1.5m USDC"
 *
 * formatTokens([
 *   { symbol: 'ETH', amount: 10.5 },
 *   { symbol: 'BTC', amount: 2500000 }
 * ])
 * // Returns: "10.5 ETH + 2.5m BTC"
 *
 * formatTokens({ symbol: 'ETH', amount: 10.555 }, 3)
 * // Returns: "10.555 ETH"
 */
export const formatTokens = (tokens: TokenAmount | TokenAmount[], decimals = 2) =>
  toArray(tokens)
    .map(({ amount, symbol }) => {
      const value = Number(amount)
      const amountAbbreviated = abbreviateNumber(value)
      const amountRounded = amountAbbreviated.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })
      return `${amountRounded}${scaleSuffix(value)} ${symbol}`
    })
    .join(' + ')
