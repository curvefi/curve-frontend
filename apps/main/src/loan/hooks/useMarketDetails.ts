import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { Address, Chain } from '@curvefi/prices-api'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { MarketDetailsProps } from '@ui-kit/features/market-details'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'

type UseMarketDetailsProps = {
  chainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
}

export const useMarketDetails = ({ chainId, llamma, llammaId }: UseMarketDetailsProps): MarketDetailsProps => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: llamma?.collateral,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId: chainId,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId: networks[chainId as keyof typeof networks]?.id,
    contractAddress: llamma?.controller as Address,
  })

  const thirtyDayAvgBorrowAPR = useMemo(() => {
    if (!crvUsdSnapshots) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentSnapshots = crvUsdSnapshots.filter((snapshot) => new Date(snapshot.timestamp) > thirtyDaysAgo)

    if (recentSnapshots.length === 0) return null

    return meanBy(recentSnapshots, ({ rate }) => rate) * 100
  }, [crvUsdSnapshots])

  return {
    marketType: 'mint',
    blockchainId: networks[chainId as keyof typeof networks]?.id as Chain,
    collateral: {
      symbol: llamma?.collateralSymbol ?? null,
      tokenAddress: llamma?.collateral,
      total: loanDetails?.totalCollateral ? Number(loanDetails.totalCollateral) : null,
      totalUsdValue: loanDetails?.totalCollateral
        ? Number(loanDetails.totalCollateral) * Number(collateralUsdRate)
        : null,
      usdRate: collateralUsdRate ? Number(collateralUsdRate) : null,
      loading: collateralUsdRateLoading || (loanDetails?.loading ?? true),
    },
    borrowToken: {
      symbol: 'crvUSD',
      tokenAddress: CRVUSD_ADDRESS,
      usdRate: borrowedUsdRate ? Number(borrowedUsdRate) : null,
      loading: borrowedUsdRateLoading || (loanDetails?.loading ?? true),
    },
    borrowAPY: {
      value: loanDetails?.parameters?.rate ? Number(loanDetails?.parameters?.rate) : null,
      thirtyDayAvgRate: thirtyDayAvgBorrowAPR,
      loading: isSnapshotsLoading || (loanDetails?.loading ?? true),
    },
    availableLiquidity: {
      value: loanDetails?.capAndAvailable?.available ? Number(loanDetails.capAndAvailable.available) : null,
      max: loanDetails?.capAndAvailable?.cap ? Number(loanDetails.capAndAvailable.cap) : null,
      loading: loanDetails?.loading ?? true,
    },
  }
}
