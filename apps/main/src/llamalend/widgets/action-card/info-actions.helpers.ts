import { notFalsy } from '@curvefi/primitives/objects.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Amount, formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const formatAmount = (value: Amount | null | undefined, symbol?: string) =>
  value == null ? '-' : notFalsy(formatNumber(value, { abbreviate: true }), symbol).join(' ')

export const formatLeverage = (value: Amount | null | undefined) =>
  value == null ? '-' : formatNumber(value, { abbreviate: false, decimals: 2, unit: 'multiplier' })

export const ACTION_INFO_GROUP_SX = { gap: Spacing.sm }
