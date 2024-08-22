import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

export function getTotalApr(lendApr: number, crvBase: number, crvBoost: number, others: RewardOther[]) {
  const othersTotal = (others ?? []).reduce((prev, curr) => {
    prev += curr.apy
    return prev
  }, 0)

  const min = (lendApr + crvBase + othersTotal).toString()
  const max = (lendApr + crvBoost + othersTotal).toString()

  return {
    min,
    max,
    minMax:
      min === max
        ? formatNumber(min, FORMAT_OPTIONS.PERCENT)
        : `${formatNumber(min, FORMAT_OPTIONS.PERCENT)} - ${formatNumber(max, FORMAT_OPTIONS.PERCENT)}`,
  }
}
