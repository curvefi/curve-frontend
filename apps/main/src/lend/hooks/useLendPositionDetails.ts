import { meanBy } from 'lodash'
import { useMemo } from 'react'
import { useMarketOnChainRates } from '@/lend/entities/market-onchain-rate'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { useLendingSnapshots } from '@ui-kit/entities/lending-snapshots'
import { LendPositionDetailsProps } from '@ui-kit/shared/ui/PositionDetails/LendPositionDetails'

type UseLendPositionDetailsProps = {
  chainId: ChainId
  market: OneWayMarketTemplate | null | undefined
  marketId: string
  userActiveKey: string
}

export const useLendPositionDetails = ({
  chainId,
  market,
  marketId,
  userActiveKey,
}: UseLendPositionDetailsProps): LendPositionDetailsProps => {
  const userBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey]) // TODO: add loading state
  const { data: onChainRatesData, isLoading: isOnchainRatesLoading } = useMarketOnChainRates({
    chainId: chainId,
    marketId,
  })
  const { data: lendSnapshots, isLoading: isLendSnapshotsLoading } = useLendingSnapshots({
    blockchainId: networks[chainId].id as Chain,
    contractAddress: market?.addresses?.controller as Address,
  })

  const thirtyDayAvgLendApr = useMemo(() => {
    if (!lendSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = lendSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ lendApr }) => lendApr) * 100
  }, [lendSnapshots])

  return {
    lendingAPY: {
      value: onChainRatesData?.rates?.lendApy ? Number(onChainRatesData.rates.lendApy) : null,
      thirtyDayAvgRate: thirtyDayAvgLendApr,
      loading: isOnchainRatesLoading || isLendSnapshotsLoading,
    },
    shares: {
      value: userBalancesResp?.vaultShares
        ? Number(userBalancesResp.vaultShares) + Number(userBalancesResp.gauge)
        : null,
      staked: userBalancesResp?.gauge ? Number(userBalancesResp.gauge) : null,
      loading: false,
    },
    lentAsset: {
      symbol: 'CRV',
      address: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
      usdRate: 0,
      depositedAmount: 0,
      depositedUsdValue: 0,
      loading: false,
    },
  }
}
