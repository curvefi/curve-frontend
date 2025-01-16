import { formatNumber, NumberFormatOptions } from '@/ui/utils'

export function format(val: string | number | undefined, options?: NumberFormatOptions | undefined) {
  return formatNumber(val, { ...options, maximumSignificantDigits: 5 })
}
