import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import useStore from '@/lend/store/useStore'
import { ChainId, MarketRates, RewardOther, MarketRewards } from '@/lend/types/lend.types'
import { getTotalApr } from '@/lend/utils/utilsRewards'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

function useSupplyTotalApr(rChainId: ChainId, rOwmId: string) {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const marketRewardsResp = useStore((state) => state.markets.rewardsMapper[rChainId]?.[rOwmId])
  const marketRatesResp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])
  const {
    data: onChainRates,
    isError: onChainError,
    isSuccess: onChainSuccess,
  } = useMarketOnChainRates({ chainId: rChainId, marketId: rOwmId })

  const { gauge } = market?.addresses ?? {}
  const { error: rewardsError } = marketRewardsResp ?? {}
  const { error: ratesError } = marketRatesResp ?? {}
  const onChainRatesObj: MarketRates = {
    rates: onChainRates ?? null,
    error: onChainError ? 'Error fetching on chain data' : '',
  }

  const marketRates = onChainRatesObj.rates ? onChainRatesObj : marketRatesResp
  const isReady = onChainSuccess || (typeof marketRewardsResp !== 'undefined' && typeof marketRatesResp !== 'undefined')
  const isError = (onChainError && ratesError) || rewardsError

  const { totalApr, tooltipValues } = useMemo(
    () => _getTotalAndTooltip(marketRewardsResp, marketRates),
    [marketRewardsResp, marketRates],
  )

  return {
    isReady,
    isError,
    invalidGaugeAddress: typeof gauge !== 'undefined' && gauge === zeroAddress,
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
