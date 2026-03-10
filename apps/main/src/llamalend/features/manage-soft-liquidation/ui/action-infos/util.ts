import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils'
import type { TokenAmount } from './types'

/**
 * Formats a number to a specified number of decimal places using locale string formatting.
 * Automatically removes trailing zeros for cleaner display.
 *
 * @param x - The number to format (returns '-' if null/undefined)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string or '-' for null/undefined values
 */
export const formatValue = (x?: number, decimals: number = 2) =>
  x == null
    ? '-'
    : x.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })

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
export const formatTokens = (tokens: TokenAmount | TokenAmount[], decimals: number = 2) =>
  (Array.isArray(tokens) ? tokens : [tokens])
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
