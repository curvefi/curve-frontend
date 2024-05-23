import { useMemo } from 'react'
import useStore from '@/store/useStore'

import { INVALID_ADDRESS } from '@/constants'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

function useSupplyTotalApr(rChainId: ChainId, rOwmId: string) {
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const marketRewardsResp = useStore((state) => state.markets.rewardsMapper[rChainId]?.[rOwmId])
  const marketRatesResp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { gauge } = owmData?.owm?.addresses ?? {}
  const { error: rewardsError } = marketRewardsResp ?? {}
  const { error: ratesError } = marketRatesResp ?? {}

  const { totalApr, tooltipValues } = useMemo(
    () => _getTotalAndTooltip(marketRewardsResp, marketRatesResp),
    [marketRewardsResp, marketRatesResp]
  )

  return {
    isReady: typeof marketRewardsResp !== 'undefined' && typeof marketRatesResp !== 'undefined',
    isError: rewardsError || ratesError,
    invalidGaugeAddress: typeof gauge !== 'undefined' && gauge === INVALID_ADDRESS,
    totalApr,
    tooltipValues,
  }
}

function _getTotalApr(lendApr: number, crvBase: number, crvBoost: number, others: RewardOther[]) {
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

function _getTooltipValue(lendApr: number, lendApy: number, crvBase: number, crvBoost: number, others: RewardOther[]) {
  return {
    lendApr: formatNumber(lendApr, FORMAT_OPTIONS.PERCENT),
    lendApy: `${formatNumber(lendApy, FORMAT_OPTIONS.PERCENT)} APY`,
    crvBase,
    crv: crvBase > 0 ? formatNumber(crvBase, FORMAT_OPTIONS.PERCENT) : '',
    crvBoosted: crvBoost > 0 ? formatNumber(crvBoost, FORMAT_OPTIONS.PERCENT) : '',
    incentives: others.map((o) => `${formatNumber(o.apy, FORMAT_OPTIONS.PERCENT)} ${o.symbol}`),
    incentivesObj: others,
  }
}

function _getTotalAndTooltip(marketRewardsResp: MarketRewards, marketRatesResp: MarketRates) {
  if (typeof marketRewardsResp === 'undefined' || typeof marketRatesResp === 'undefined')
    return {
      totalApr: { min: '', max: '', minMax: '' },
      tooltipValues: null,
    }

  const { other, crv } = marketRewardsResp.rewards ?? {}
  const { rates } = marketRatesResp ?? {}

  const lendApr = +(rates?.lendApr || '0')
  const lendApy = +(rates?.lendApy || '0')
  const [crvBase = 0, crvBoost = 0] = crv ?? []
  const others = other ?? []

  return {
    totalApr: _getTotalApr(lendApr, crvBase, crvBoost, others),
    tooltipValues: _getTooltipValue(lendApr, lendApy, crvBase, crvBoost, others),
  }
}

export default useSupplyTotalApr
