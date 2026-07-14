import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from './number'

export const formatToken = <T extends Amount | null | undefined>(value: T, symbol: string) =>
  `${formatNumber(value, 'token.compact')} ${symbol}`
