import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useStore } from '@/lend/store/useStore'
import { ChainId, MarketRates, RewardOther, MarketRewards } from '@/lend/types/lend.types'
import { getTotalApr } from '@/lend/utils/utilsRewards'
import { useMarketRates } from '@/llamalend/queries/market'
import { formatNumber } from '@ui-kit/utils'
import { useLendMarketData } from '../hooks/useLendMarket'

export function useSupplyTotalApr(rChainId: ChainId, marketId: string) {
  const market = useLendMarketData(rChainId, marketId).data
  const marketRewardsResp = useStore(state => state.markets.rewardsMapper[rChainId]?.[marketId])
  const marketRatesResp = useStore(state => state.markets.ratesMapper[rChainId]?.[marketId])
  const {
    data: marketRatesData,
    isError: onChainError,
    isSuccess: onChainSuccess,
  } = useMarketRates({ chainId: rChainId, marketId })

  const { gauge } = market?.addresses ?? {}
  const { error: rewardsError } = marketRewardsResp ?? {}
  const { error: ratesError } = marketRatesResp ?? {}
  const onChainRatesObj: MarketRates = {
    rates: marketRatesData
      ? {
          borrowApr: marketRatesData.borrowApr?.toString() ?? '',
          lendApr: marketRatesData.lendApr?.toString() ?? '',
          borrowApy: marketRatesData.borrowApy?.toString() ?? '',
          lendApy: marketRatesData.lendApy?.toString() ?? '',
        }
      : null,
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
    lendApr: formatNumber(lendApr, { unit: 'percentage', abbreviate: false }),
    lendApy: `${formatNumber(lendApy, { unit: 'percentage', abbreviate: false })} APY`,
    crvBase,
    crv: crvBase > 0 ? formatNumber(crvBase, { unit: 'percentage', abbreviate: false }) : '',
    crvBoosted: crvBoost > 0 ? formatNumber(crvBoost, { unit: 'percentage', abbreviate: false }) : '',
    incentives: others.map(o => `${formatNumber(o.apy, { unit: 'percentage', abbreviate: false })} ${o.symbol}`),
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

  const lendApr = Number(rates?.lendApr || '0')
  const lendApy = Number(rates?.lendApy || '0')
  const [crvBase = 0, crvBoost = 0] = crv ?? []
  const others = other ?? []

  return {
    totalApr: getTotalApr(lendApy, crvBase, crvBoost, others),
    tooltipValues: _getTooltipValue(lendApr, lendApy, crvBase, crvBoost, others),
  }
}
