import { useStore } from '@/lend/store/useStore'
import { ChainId, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { MarketDetailsProps } from '@ui-kit/shared/ui/MarketDetails'

type UseMarketDetailsProps = {
  chainId: ChainId
  llamma: OneWayMarketTemplate | null | undefined
  llammaId: string
}

export const useMarketDetails = ({ chainId, llamma, llammaId }: UseMarketDetailsProps): MarketDetailsProps => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])

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
