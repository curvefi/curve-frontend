import { detect, fromUrl, fromNavigator } from '@lingui/detect-locale'
import BigNumber from 'bignumber.js'
import isUndefined from 'lodash/isUndefined'
import isNaN from 'lodash/isNaN'
import { MAX_USD_VALUE } from './utilsConstants'

BigNumber.config({ EXPONENTIAL_AT: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP })
export const BN = BigNumber

const localeDetected =
  (typeof window !== 'undefined' && detect(fromUrl('lang'), fromNavigator(), () => 'en')) || 'en-US'

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  defaultValue?: string // value to display when it is undefined || null || empty string
  showAllFractionDigits?: boolean // do not hide any decimal digits
  showDecimalIfSmallNumberOnly?: boolean // show decimal if value is < 10
  trailingZeroDisplay?: 'auto' | 'stripIfInteger'
}

export const FORMAT_OPTIONS = {
  PERCENT: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'percent',
  },
  USD: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currency: 'USD',
    style: 'currency',
  },
} as const

export function shouldUseDefaultFractionDigits(parsedOptions: NumberFormatOptions) {
  return (
    !('minimumFractionDigits' in parsedOptions) &&
    !('maximumFractionDigits' in parsedOptions) &&
    !('minimumSignificantDigits' in parsedOptions) &&
    !('maximumSignificantDigits' in parsedOptions)
  )
}

export function getDecimal(val: number | string, defaultDecimal: number) {
  const decimal = val.toString().split('.')[1]?.length ?? 0
  return decimal > defaultDecimal ? defaultDecimal : decimal
}

export function getFractionDigitsOptions(val: number | string | undefined | null, defaultDecimal: number) {
  let formatOptions: NumberFormatOptions = {}
  if (val && Number(val) >= 0) {
    const decimal = getDecimal(val, defaultDecimal)
    formatOptions.minimumFractionDigits = decimal
    formatOptions.maximumFractionDigits = decimal
  }
  return formatOptions
}

function formattedNumberIsZero(val: number | string, formatOptions: NumberFormatOptions) {
  const { useGrouping, style, notation, ...rest } = formatOptions
  return Number(new Intl.NumberFormat('en-US', rest).format(Number(val))) === 0
}

export function formatNumber(val: number | string | undefined | null, options?: NumberFormatOptions | undefined) {
  const { defaultValue, showAllFractionDigits, showDecimalIfSmallNumberOnly, notation, ...numberFormatOptions } =
    options ?? {}
  try {
    if (typeof val === 'undefined' || val === null || val === '') {
      return defaultValue || ''
    } else if (isNaN(Number(val))) {
      return '?'
    } else {
      let parsedOptions: NumberFormatOptions = { ...numberFormatOptions, useGrouping: true }
      if (parsedOptions.currency === 'USD') {
        parsedOptions.style = 'currency'
      }

      if (Number(val) === 0) {
        parsedOptions.trailingZeroDisplay = 'stripIfInteger'
        return new Intl.NumberFormat(localeDetected, parsedOptions).format(Number(val))
      } else {
        const numVal = Number(val)
        const parsedVal = new BigNumber(val).toString()

        if (shouldUseDefaultFractionDigits(parsedOptions)) {
          if (showAllFractionDigits) {
            parsedOptions.minimumFractionDigits = new BigNumber(Number(val)).toString().split('.')[1]?.length ?? 0
          } else if (showDecimalIfSmallNumberOnly && numVal > 10) {
            parsedOptions.maximumFractionDigits = 0
          } else if (options?.style === 'percent') {
            parsedOptions.maximumFractionDigits = getDecimal(parsedVal, 2)
          } else if (notation === 'compact') {
            delete parsedOptions.minimumFractionDigits
            delete parsedOptions.maximumFractionDigits
            if (numVal >= 1000000) {
              parsedOptions.maximumFractionDigits = getDecimal(parsedVal, 2)
              parsedOptions.notation = notation
            } else {
              if (numVal > 10) {
                parsedOptions.trailingZeroDisplay = 'stripIfInteger'
                parsedOptions.maximumFractionDigits = 0
                parsedOptions.minimumFractionDigits = 0
              } else {
                parsedOptions.minimumFractionDigits = getDecimal(parsedVal, 5)
              }
            }
          } else {
            parsedOptions.minimumFractionDigits = getDecimal(parsedVal, 5)
          }
        }

        if (Number(val) < 1) {
          // reformat formatted number showing 0, but !== 0
          if (formattedNumberIsZero(val, parsedOptions)) {
            if (Number(val) < 0.000000001 && parsedOptions.style !== 'percent') {
              return '<0.000000001'
            } else {
              const { minimumFractionDigits, maximumFractionDigits, ...rest } = parsedOptions
              return _formatNumber(val, { ...rest, minimumSignificantDigits: 2, maximumSignificantDigits: 2 })
            }
          } else if (Number(val) <= 0.0009 && !('showAllFractionDigits' in (options ?? {}))) {
            const { minimumFractionDigits, maximumFractionDigits, ...rest } = parsedOptions
            // format number to maximumSignificantDigits of 4 if value is <= 0.0009
            return _formatNumber(val, { ...(rest ?? {}), maximumSignificantDigits: 4 })
          }
        }

        return _formatNumber(val, { ...parsedOptions, ...numberFormatOptions })
      }
    }
  } catch (error) {
    console.error(error, { params: { val, options } })
    if (typeof val === 'undefined' || val === null || val === '') {
      return defaultValue || ''
    } else if (isNaN(Number(val))) {
      return '?'
    } else {
      return val.toString()
    }
  }
}

function _formatNumber(val: string | number, options: NumberFormatOptions) {
  if (options.currency === 'USD' && Number(val) > MAX_USD_VALUE) {
    console.warn(`USD value is too large: ${val}`)
    return `?`
  }
  return new Intl.NumberFormat(localeDetected, options).format(
    options.style === 'percent' ? Number(val) / 100 : Number(val),
  )
}

export function formatNumberUsdRate(usdRate: number | string | undefined, hideCurrencySymbol?: boolean) {
  let parsedUsdRate = ''

  if (isUndefined(usdRate)) {
    return ''
  } else if (isNaN(usdRate)) {
    parsedUsdRate = '$N/A'
  } else if (usdRate) {
    if (Number(usdRate) < 0.0000001) {
      const options: NumberFormatOptions = {
        currency: 'USD',
        showAllFractionDigits: true,
      }
      if (hideCurrencySymbol) delete options.currency
      parsedUsdRate = `<${formatNumber(0.0000001, options)}`
    } else {
      const options: NumberFormatOptions = {
        ...(Number(usdRate) > 10 ? { minimumFractionDigits: 2 } : {}),
        currency: 'USD',
      }
      if (hideCurrencySymbol) delete options.currency
      parsedUsdRate = formatNumber(usdRate, options)
    }
  }

  return parsedUsdRate
}

/**
 * Format number with the given precision digits, without rounding the whole part of the number.
 * @param value number to format
 * @param precisionDigits number of decimal digits to show. This will be the maximum number of decimal digits.
 */
export function formatNumberWithPrecision(value: number, precisionDigits: number) {
  const valueDigits = Math.max(0, Math.floor(Math.log10(value)))
  const fractionDigits = precisionDigits - Math.min(precisionDigits, valueDigits)
  const opts = { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }
  return _formatNumber(value, opts)
}

export const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

export const formatDateFromTimestamp = (unixTime: number) => {
  const date = new Date(unixTime * 1000)
  return formatDate(date)
}

export const convertToLocaleTimestamp = (unixTime: number) => unixTime - new Date().getTimezoneOffset() * 60
