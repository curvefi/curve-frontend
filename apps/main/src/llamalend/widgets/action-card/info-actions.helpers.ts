import BigNumber from 'bignumber.js'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { QueryProp } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const formatAmount = (value: Amount | null | undefined, symbol?: string) =>
  value == null ? '-' : notFalsy(formatNumber(value, { abbreviate: true }), symbol).join(' ')

export const formatLeverage = (value: Amount | null | undefined) =>
  value == null ? '-' : formatNumber(value, { abbreviate: false, decimals: 2, unit: 'multiplier' })

export const calculateLeverageCollateral = (
  totalCollateral: Decimal | null | undefined,
  leverage: Decimal | null | undefined,
) =>
  totalCollateral &&
  leverage &&
  (new BigNumber(leverage).isZero()
    ? '0' // when leverage is 0, e.g. full repay, the collateral needed is 0
    : decimal(new BigNumber(totalCollateral).minus(new BigNumber(totalCollateral).div(leverage))))

export const ACTION_INFO_GROUP_SX = { gap: Spacing.sm }

export const combineActionInfoState = (...queries: (QueryProp<unknown> | undefined)[]) => {
  const { isLoading, error } = combineQueryState(...queries)
  return { loading: isLoading, error }
}

// Returns whether an action info should stay visible when its value differs from the reference value.
export const isQueryValueNotEqual = (
  value: QueryProp<Decimal | null> | undefined,
  comparedValue: Decimal | null | undefined,
) =>
  value &&
  // Keep the action info visible while loading or when the query has failed
  (value?.isLoading ||
    value?.error ||
    // Otherwise, show it only when both values exist and they are numerically different
    (comparedValue != null && value?.data != null && !new BigNumber(value.data).isEqualTo(comparedValue)))
