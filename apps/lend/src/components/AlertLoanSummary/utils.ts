import { formatNumber } from '@/ui/utils'

export function format(val: string | number | undefined) {
  return formatNumber(val, { maximumSignificantDigits: 5 })
}
