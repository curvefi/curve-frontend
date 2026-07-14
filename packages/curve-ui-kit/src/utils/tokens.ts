import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from './number'

/** Formats a token amount with compact suffixes for dense displays, e.g. "1.23k CRV". */
export const formatTokenCompact = <T extends Amount | null | undefined>(value: T, symbol: string) =>
  `${formatNumber(value, 'token.compact')} ${symbol}`

/** Formats a regular token amount without abbreviation, e.g. "1,234.56 crvUSD". */
export const formatTokenAmount = <T extends Amount | null | undefined>(value: T, symbol: string) =>
  `${formatNumber(value, 'token.amount')} ${symbol}`

/** Formats a wallet/balance-style token amount with balance precision rules, e.g. "0.0000012346 ETH". */
export const formatTokenBalance = <T extends Amount | null | undefined>(value: T, symbol: string) =>
  `${formatNumber(value, 'token.balance')} ${symbol}`
