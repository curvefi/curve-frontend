import { formatNumber, type NumberFormatOptions, amount } from '@ui-kit/utils'

export function format(val: string | number | undefined, options?: Partial<NumberFormatOptions> | undefined) {
  return formatNumber(amount(val), { ...options, abbreviate: false, fallback: '-' })
}
