import { sum } from 'lodash'
import { useMemo } from 'react'
import { type Address } from 'viem'
import { BaseRateTooltipContent } from '@/dex/components/BaseRateTooltipContent'
import { CrvRateTooltipContent } from '@/dex/components/CrvRateTooltipContent'
import { useNetworkByChain } from '@/dex/entities/networks'
import { defaultNetworks } from '@/dex/lib/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import { AVERAGE_CATEGORIES, Chain } from '@evm-ui/utils'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils/address'
import { scanAddressPath, scanTokenPath } from '@legacy-ui/utils'
import { maybe, maybes } from '@primitives/objects.utils'
import type { YieldBreakdownRow } from '../components/yield-breakdown/columns/columns.definitions'

const COMPOUND_WINDOW = AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].window

export const getBaseRateRow = ({
  baseDailyRate,
  baseWeeklyRate,
  rateDisplay,
}: {
  baseDailyRate: number | null | undefined
  baseWeeklyRate: number | null | undefined
  rateDisplay: ReturnType<typeof useRateDisplay>
}): YieldBreakdownRow | null =>
  maybe(baseDailyRate, dailyRate => ({
    source: {
      icon: null,
      iconPosition: 'left',
      primary: rateDisplay === 'apy' ? t`Base APY` : t`Base APR`,
    },
    rate: dailyRate,
    rateTooltip: {
      title: rateDisplay === 'apy' ? t`Base APY` : t`Base APR`,
      body: <BaseRateTooltipContent dailyRate={dailyRate} weeklyRate={baseWeeklyRate} />,
      clickable: true,
    },
  })) ?? null

export const useYieldBreakdown = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const gaugeIsKilled = !!poolDataCacheOrApi.gauge.isKilled
  const { data: network } = useNetworkByChain({ chainId })
  const rewardsApy = useStore(state => state.pools.rewardsApyMapper[chainId]?.[poolId])

  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.networkId,
    address: poolAddress,
  })

  // CurveJS sometimes omits token prices, so fall back to the shared token-rates query.
  const missingTokenRates = useMemo(
    () =>
      rewardsApy?.other?.flatMap(({ tokenAddress, tokenPrice }) => (tokenPrice == null ? [tokenAddress] : [])) ?? [],
    [rewardsApy?.other],
  )
  const { data: fallbackTokenRates } = useTokenUsdRates(
    { chainId, tokenAddresses: missingTokenRates },
    missingTokenRates.length > 0,
  )

  const { data: crvPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })
  const crvAprs = gaugeIsKilled ? undefined : rewardsApy?.crv
  const unboostedCrvRate = maybe(crvAprs?.[0], apr => convertAprToApy(apr, COMPOUND_WINDOW))
  const maxBoostCrvRate = maybe(crvAprs?.[1], apr => convertAprToApy(apr, COMPOUND_WINDOW))
  const crvRateRange = useMemo(
    () =>
      maybes([unboostedCrvRate, maxBoostCrvRate], (unboostedRate, maximumRate) => ({
        unboostedRate,
        maximumRate,
      })),
    [maxBoostCrvRate, unboostedCrvRate],
  )

  const baseDailyRate = maybe(pricesApiPoolData?.baseDailyApr, apr =>
    convertAprToApy(apr * 100, COMPOUND_WINDOW),
  )
  const baseWeeklyRate = maybe(pricesApiPoolData?.baseWeeklyApr, apr =>
    convertAprToApy(apr * 100, COMPOUND_WINDOW),
  )

  // Construct all yield rows imperatively rather than functionally to keep each independent source explicit.
  const rows: YieldBreakdownRow[] = useMemo(() => {
    const rows: YieldBreakdownRow[] = []

    if (crvAprs?.some(Boolean)) {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          address: MAINNET_CRV_ADDRESS,
          blockchainId: 'ethereum',
          iconPosition: 'left',
          primary: 'CRV',
        },
        address: MAINNET_CRV_ADDRESS,
        explorerUrl: scanTokenPath(defaultNetworks[Chain.Ethereum], MAINNET_CRV_ADDRESS),
        price: crvPrice,
        rate: unboostedCrvRate,
        maxBoostRate: maxBoostCrvRate,
        ...maybe(crvRateRange, rateRange => ({
          rateTooltip: {
            title: rateDisplay === 'apy' ? t`Gauge APY` : t`Gauge APR`,
            body: <CrvRateTooltipContent {...rateRange} />,
            clickable: true,
          },
        })),
      })
    }

    rewardsApy?.other?.forEach(({ apy: apr, symbol, tokenAddress, tokenPrice }) => {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          address: tokenAddress,
          blockchainId: network?.id,
          iconPosition: 'left',
          primary: symbol,
        },
        address: tokenAddress,
        explorerUrl: scanTokenPath(network, tokenAddress),
        price: tokenPrice ?? fallbackTokenRates?.[tokenAddress],
        rate: convertAprToApy(apr, COMPOUND_WINDOW),
      })
    })

    campaigns.forEach(({ reward, symbol, platform, platformImageId }) => {
      if (reward?.type !== 'apr') return

      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push({
        source: {
          icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
          iconPosition: 'left',
          primary: symbol,
        },
        address: reward.address,
        explorerUrl: scanAddressPath(network, reward.address),
        price: reward.price,
        rate: convertAprToApy(reward.value, COMPOUND_WINDOW),
      })
    })

    const baseRateRow = getBaseRateRow({ baseDailyRate, baseWeeklyRate, rateDisplay })
    if (baseRateRow) {
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      rows.push(baseRateRow)
    }

    return rows
  }, [
    baseDailyRate,
    baseWeeklyRate,
    campaigns,
    convertAprToApy,
    crvAprs,
    crvPrice,
    crvRateRange,
    fallbackTokenRates,
    maxBoostCrvRate,
    network,
    rateDisplay,
    rewardsApy?.other,
    unboostedCrvRate,
  ])

  const total = useMemo(() => sum(rows.map(row => row.rate ?? 0)), [rows])

  return {
    maxBoostTotal:
      maybe(crvRateRange, ({ unboostedRate, maximumRate }) => total - unboostedRate + maximumRate) ?? 0,
    total,
    rows,
  }
}
