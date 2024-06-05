import { formatNumber, NumberFormatOptions } from '@/ui/utils'

export function format(val: string | number | undefined) {
  const options: NumberFormatOptions =
    val && +val > 10
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { minimumFractionDigits: 5, maximumFractionDigits: 5 }
  return formatNumber(val, options)
}
