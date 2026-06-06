import { sum } from 'lodash'
import { useMemo } from 'react'
import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import { maybe } from '@primitives/objects.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain } from '@ui-kit/utils'
import { MAINNET_CRV_ADDRESS } from '@ui-kit/utils/address'
import type { YieldBreakdownRow } from '../components/yield-breakdown/columns/columns.definitions'

const { IconSize } = SizesAndSpaces

export const useYieldBreakdown = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
}) => {
  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const gaugeIsKilled = !!poolDataCacheOrApi.gauge.isKilled
  const { data: network } = useNetworkByChain({ chainId })
  const rewardsApy = useStore(state => state.pools.rewardsApyMapper[chainId]?.[poolId])
  const { data: crvPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network?.networkId as BlockchainId | undefined,
    address: poolAddress,
  })

  // Construct all yield rows imperatively rather than functional to improve readability
  const rows: YieldBreakdownRow[] = useMemo(() => {
    const rows: YieldBreakdownRow[] = []
    const crvBase = rewardsApy?.crv?.[0]
    const crvMax = rewardsApy?.crv?.[1] ?? crvBase
    if (crvBase || crvMax) {
      rows.push({
        source: {
          address: MAINNET_CRV_ADDRESS,
          blockchainId: 'ethereum',
          iconPosition: 'left',
          primary: 'CRV',
        },
        address: MAINNET_CRV_ADDRESS,
        price: crvPrice,
        dailyApr: gaugeIsKilled ? undefined : crvMax,
        dailyAprSecondary: gaugeIsKilled ? undefined : crvBase,
        dailyAprTooltip: gaugeIsKilled ? undefined : t`Max CRV tAPR can be reached with max boost for this pool.`,
      })
    }

    rewardsApy?.other?.forEach(({ apy, symbol, tokenAddress, tokenPrice }) => {
      rows.push({
        source: {
          address: tokenAddress,
          blockchainId: network?.id,
          iconPosition: 'left',
          primary: symbol,
        },
        address: tokenAddress,
        price: tokenPrice,
        dailyApr: apy,
      })
    })

    campaigns
      .filter(({ tags }) => !tags.includes('points'))
      .forEach(({ address, multiplier, platform, platformImageId }) => {
        rows.push({
          source: {
            icon: (
              <Box
                component="img"
                src={platformImageId}
                alt={platform}
                sx={{ borderRadius: '50%', width: IconSize.lg, height: IconSize.lg }}
              />
            ),
            iconPosition: 'left',
            primary: platform,
          },
          address,
          dailyApr: Number(multiplier),
        })
      })

    rows.push({
      source: {
        icon: null,
        iconPosition: 'left',
        primary: t`Swap fees`,
      },
      dailyApr: maybe(rewardsApy?.base?.day, x => (+x > 0 ? +x : undefined)),
    })

    return rows
  }, [campaigns, crvPrice, gaugeIsKilled, network, rewardsApy])

  return {
    dailyBaseTotal: useMemo(() => sum(rows.map(row => row.dailyAprSecondary ?? row.dailyApr)), [rows]),
    dailyTotal: useMemo(() => sum(rows.map(row => row.dailyApr)), [rows]),
    rows,
  }
}
