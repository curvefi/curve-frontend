import BigNumber from 'bignumber.js'
import { formatNumber, type NumberFormatOptions } from '@ui-kit/utils'

// At the moment of writing there's a Notion ticket to remove BigNumber.js
BigNumber.config({ EXPONENTIAL_AT: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP })
export const BN = BigNumber

export function getFractionDigitsOptions(val: number | string | undefined | null, defaultDecimal: number) {
  function getDecimal(val: number | string, defaultDecimal: number) {
    const decimal = val.toString().split('.')[1]?.length ?? 0
    return decimal > defaultDecimal ? defaultDecimal : decimal
  }

  const formatOptions: Partial<NumberFormatOptions> = {}
  if (val && Number(val) >= 0) {
    const decimal = getDecimal(val, defaultDecimal)
    formatOptions.minimumFractionDigits = decimal
    formatOptions.maximumFractionDigits = decimal
  }
  return formatOptions
}

export const formatNumberRange = (numbers: number[] | null | undefined) =>
  !numbers || numbers?.some(n => n == null) || numbers.every(n => !n)
    ? ''
    : numbers.map(n => formatNumber(n, { abbreviate: false })).join(' - ')
