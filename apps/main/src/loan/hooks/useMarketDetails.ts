import type { MarketDetailsProps } from '@/llamalend/features/market-details'
import { DAYS_BACK, useRateMetrics } from '@/llamalend/hooks/useRateMetrics'
import { useMarketRates } from '@/llamalend/queries/market-rates'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useMintMarketMaxLeverage } from '@/loan/entities/mint-market-max-leverage'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { Address } from '@curvefi/prices-api'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'

type UseMarketDetailsProps = {
  chainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
}

export const useMarketDetails = ({ chainId, llamma, llammaId }: UseMarketDetailsProps): MarketDetailsProps => {
  const { isHydrated } = useCurve()
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({ chainId, marketId: llammaId })
  const blockchainId = networks[chainId]?.id
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId,
    address: llamma?.controller?.toLocaleLowerCase() as Address,
  })
  const loanDetails = useStore((state) => state.loans.detailsMapper[llammaId ?? ''])
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: llamma?.collateral,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId,
    contractAddress: llamma?.controller as Address,
    agg: 'day',
    limit: DAYS_BACK, // fetch last 30 days for 30 day average calcs
  })
  const { data: maxLeverage, isLoading: isMarketMaxLeverageLoading } = useMintMarketMaxLeverage({
    chainId,
    marketId: llammaId,
  })
  const collateralRebasingYieldApr = crvUsdSnapshots?.[crvUsdSnapshots.length - 1]?.collateralToken.rebasingYieldApr
  const borrowApr = marketRates?.borrowApr == null ? null : Number(marketRates.borrowApr)
  const {
    averageRate,
    averageRebasingYield,
    totalRate: totalBorrowRate,
    averageTotalRate: totalAverageBorrowRate,
  } = useRateMetrics({
    rate: borrowApr,
    rebasingYield: collateralRebasingYieldApr ?? null,
    average: {
      snapshots: crvUsdSnapshots,
      daysBack: DAYS_BACK,
      getRate: ({ borrowApr }) => borrowApr,
      getRebasingYield: ({ collateralToken }) => collateralToken.rebasingYieldApr,
    },
  })

  return {
    marketType: LlamaMarketType.Mint,
    blockchainId,
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
    borrowRate: {
      rate: borrowApr,
      averageRate: averageRate,
      averageRateLabel: `${DAYS_BACK}D`,
      rebasingYield: collateralRebasingYieldApr ?? null,
      averageRebasingYield: averageRebasingYield ?? null,
      totalAverageBorrowRate,
      extraRewards: campaigns,
      totalBorrowRate,
      loading: isSnapshotsLoading || isMarketRatesLoading || !isHydrated,
    },
    maxLeverage: {
      value: maxLeverage,
      loading: !llamma || isMarketMaxLeverageLoading,
    },
    availableLiquidity: {
      value: loanDetails?.capAndAvailable?.available ? Number(loanDetails.capAndAvailable.available) : null,
      max: loanDetails?.capAndAvailable?.cap ? Number(loanDetails.capAndAvailable.cap) : null,
      loading: loanDetails?.loading ?? true,
    },
  }
}
