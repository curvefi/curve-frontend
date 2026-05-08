import { RewardOther } from '@/lend/types/lend.types'
import { FORMAT_OPTIONS } from '@ui/utils'
import { formatNumber, amount } from '@ui-kit/utils'

export function getTotalApr(lendApy: number, crvBase: number, crvBoost: number, others: RewardOther[]) {
  const othersTotal = (others ?? []).reduce((prev, curr) => {
    prev += curr.apy
    return prev
  }, 0)

  const min = (lendApy + crvBase + othersTotal).toString()
  const max = (lendApy + crvBoost + othersTotal).toString()

  return {
    min,
    max,
    minMax:
      min === max
        ? (formatNumber(amount(min), FORMAT_OPTIONS.PERCENT) ?? '-')
        : `${formatNumber(amount(min), FORMAT_OPTIONS.PERCENT) ?? '-'} - ${formatNumber(amount(max), FORMAT_OPTIONS.PERCENT) ?? '-'}`,
  }
}
