import { notFalsy } from '@curvefi/prices-api/objects.util'
import { type Amount, formatNumber } from '@ui-kit/utils'

export const formatAmount = (value: Amount | null | undefined, symbol?: string) =>
  value == null ? '-' : notFalsy(formatNumber(value, { abbreviate: true }), symbol).join(' ')

export const formatLeverage = (value: Amount | null | undefined) =>
  value == null ? '-' : formatNumber(value, { abbreviate: false, decimals: 2, unit: 'multiplier' })
