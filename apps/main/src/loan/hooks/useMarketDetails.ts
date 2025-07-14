import meanBy from 'lodash/meanBy'
import { useMemo } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useCrvUsdSnapshots } from '@/loan/entities/crvusd-snapshots'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { Address } from '@curvefi/prices-api'
import { MarketDetailsProps } from '@ui-kit/shared/ui/MarketDetails'

type UseMarketDetailsProps = {
  rChainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
}

export const useMarketDetails = ({ rChainId, llamma, llammaId }: UseMarketDetailsProps): MarketDetailsProps => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])
  const usdRatesLoading = useStore((state) => state.usdRates.loading)
  const collateralUsdRate = useStore((state) => state.usdRates.tokens[llamma?.collateral ?? ''])
  const borrowedUsdRate = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId: networks[rChainId as keyof typeof networks].id,
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
    collateral: {
      symbol: llamma?.collateralSymbol ?? null,
      tokenAddress: llamma?.collateral,
      total: loanDetails?.totalCollateral ? Number(loanDetails.totalCollateral) : null,
      totalUsdValue: loanDetails?.totalCollateral
        ? Number(loanDetails.totalCollateral) * Number(collateralUsdRate)
        : null,
      usdRate: collateralUsdRate ? Number(collateralUsdRate) : null,
      loading: usdRatesLoading || (loanDetails?.loading ?? true),
    },
    borrowToken: {
      symbol: 'crvUSD',
      tokenAddress: CRVUSD_ADDRESS,
      usdRate: borrowedUsdRate ? Number(borrowedUsdRate) : null,
      loading: usdRatesLoading || (loanDetails?.loading ?? true),
    },
    borrowAPR: {
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
