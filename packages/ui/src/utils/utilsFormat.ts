import BigNumber from 'bignumber.js'
import { formatNumber as newFormatNumber } from '@ui-kit/utils'

// At the moment of writing there's a Notion ticket to remove BigNumber.js
BigNumber.config({ EXPONENTIAL_AT: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP })
export const BN = BigNumber

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  defaultValue?: string // value to display when it is undefined || null || empty string
  showAllFractionDigits?: boolean // do not hide any decimal digits
  showDecimalIfSmallNumberOnly?: boolean // show decimal if value is < 10
  decimals?: number // number of decimal places to show
}

export const FORMAT_OPTIONS = {
  PERCENT: { style: 'percent' },
  USD: { style: 'currency', currency: 'USD' },
} as const

export function getFractionDigitsOptions(val: number | string | undefined | null, defaultDecimal: number) {
  function getDecimal(val: number | string, defaultDecimal: number) {
    const decimal = val.toString().split('.')[1]?.length ?? 0
    return decimal > defaultDecimal ? defaultDecimal : decimal
  }

  const formatOptions: NumberFormatOptions = {}
  if (val && Number(val) >= 0) {
    const decimal = getDecimal(val, defaultDecimal)
    formatOptions.minimumFractionDigits = decimal
    formatOptions.maximumFractionDigits = decimal
  }
  return formatOptions
}

/** Wrapper function to keep the PR small. In the future all calls to this function should be replaced with a direct call to the new number formatter. */
export function formatNumber(val: number | string | undefined | null, options?: NumberFormatOptions | undefined) {
  if (val == null) return options?.defaultValue ?? '-'

  const unit =
    options?.style === 'currency' || options?.currency === 'USD'
      ? 'dollar'
      : options?.style === 'percent'
        ? 'percentage'
        : undefined

  const decimals = options?.showAllFractionDigits
    ? (new BigNumber(Number(val)).toString().split('.')[1]?.length ?? 0)
    : options?.decimals

  return newFormatNumber(Number(val), {
    ...options,
    unit,
    abbreviate: options?.notation === 'compact',
    decimals,
  })
}
