import { formatNumber, type NumberFormatOptions, amount } from '@ui-kit/utils'

export function format(val: string | number | undefined) {
  const options: Partial<NumberFormatOptions> =
    val && +val > 10
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { minimumFractionDigits: 5, maximumFractionDigits: 5 }
  return formatNumber(amount(val), { ...options, abbreviate: false, fallback: '-' })
}
