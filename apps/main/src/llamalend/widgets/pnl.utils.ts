import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'

export const signedAmount = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value, { abbreviate: true })}`

export const pnlText = (pnl: number, symbol: string, percent: Decimal | undefined) =>
  `${signedAmount(pnl)} ${symbol}${percent == undefined ? '' : ` (${signedAmount(Number(percent))}%)`}`

/** ROE % as the positions table and the position card show it, e.g. +1.23%. */
export const formatRoePercent = (percent: number) =>
  `${percent > 0 ? '+' : ''}${formatNumber(percent, { abbreviate: false, decimals: 2 })}%`

export const pnlColor = (value: number) => (value > 0 ? 'success' : value < 0 ? 'error' : 'textSecondary')
