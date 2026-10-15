import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'

export const signedAmount = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value, { abbreviate: true })}`

export const pnlText = (pnl: number, symbol: string, percent: Decimal | undefined) =>
  `${signedAmount(pnl)} ${symbol}${percent == undefined ? '' : ` (${signedAmount(Number(percent))}%)`}`
