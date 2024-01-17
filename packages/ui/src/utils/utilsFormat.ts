import BigNumber from 'bignumber.js'
import cloneDeep from 'lodash/cloneDeep'
import isUndefined from 'lodash/isUndefined'
import isNaN from 'lodash/isNaN'

import { detectLocale } from 'ui/src/utils/utilsLocale'

BigNumber.config({ EXPONENTIAL_AT: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP })
export const BN = BigNumber

const localeDetected = detectLocale() || 'en-US'

// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  defaultValue?: string // value to display when it is undefined || null || empty string
  showAllFractionDigits?: boolean // do not hide any decimal digits
  showDecimalIfSmallNumberOnly?: boolean // show decimal if value is < 10
  trailingZeroDisplay?: string
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

export function getSmallNumber(val: number | string, base?: number) {
  const regex = new RegExp(`^-?\\d*\\.?0*\\d{0,${base ?? 2}}`)
  return new BN(val).toString().match(regex)?.[0] ?? ''
}

function formattedNumberIsZero(val: number | string, formatOptions: NumberFormatOptions) {
  const noStyleFormatOptions = cloneDeep(formatOptions)
  noStyleFormatOptions.useGrouping = false
  delete noStyleFormatOptions.style
  delete noStyleFormatOptions.notation
  return Number(new Intl.NumberFormat(localeDetected, noStyleFormatOptions).format(Number(val))) === 0
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

        // handle small number
        if (Number(val) < 1 && formattedNumberIsZero(val, parsedOptions)) {
          if (Number(val) < 0.000000001 && parsedOptions.style !== 'percent') {
            return '<0.000000001'
          } else {
            let decimal = getSmallNumber(val, 2)?.split('.')[1]?.length ?? '0'
            parsedOptions.minimumFractionDigits = decimal
            parsedOptions.maximumFractionDigits = decimal

            return new Intl.NumberFormat(localeDetected, parsedOptions).format(
              parsedOptions.style === 'percent' ? Number(val) / 100 : Number(val)
            )
          }
        }

        return new Intl.NumberFormat(localeDetected, { ...parsedOptions, ...numberFormatOptions }).format(
          parsedOptions.style === 'percent' ? Number(val) / 100 : Number(val)
        )
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
