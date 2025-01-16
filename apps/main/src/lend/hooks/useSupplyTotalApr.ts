import { useMemo } from 'react'
import useStore from '@/lend/store/useStore'

import { INVALID_ADDRESS } from '@/lend/constants'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { getTotalApr } from '@/lend/utils/utilsRewards'
import { useOneWayMarket } from '@/lend/entities/chain'

function useSupplyTotalApr(rChainId: ChainId, rOwmId: string) {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const marketRewardsResp = useStore((state) => state.markets.rewardsMapper[rChainId]?.[rOwmId])
  const marketRatesResp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { gauge } = market?.addresses ?? {}
  const { error: rewardsError } = marketRewardsResp ?? {}
  const { error: ratesError } = marketRatesResp ?? {}

  const { totalApr, tooltipValues } = useMemo(
    () => _getTotalAndTooltip(marketRewardsResp, marketRatesResp),
    [marketRewardsResp, marketRatesResp],
  )

  return {
    isReady: typeof marketRewardsResp !== 'undefined' && typeof marketRatesResp !== 'undefined',
    isError: rewardsError || ratesError,
    invalidGaugeAddress: typeof gauge !== 'undefined' && gauge === INVALID_ADDRESS,
    totalApr,
    tooltipValues,
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
    totalApr: getTotalApr(lendApr, crvBase, crvBoost, others),
    tooltipValues: _getTooltipValue(lendApr, lendApy, crvBase, crvBoost, others),
  }
}

export default useSupplyTotalApr
