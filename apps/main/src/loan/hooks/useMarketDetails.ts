import { useMemo } from 'react'
import type { MarketDetailsProps } from '@/llamalend/features/market-details'
import { useMarketCapAndAvailable, useMarketTotalCollateral } from '@/llamalend/queries/market'
import { useMarketRates } from '@/llamalend/queries/market-rates.query'
import {
  getBorrowRateMetrics,
  getSnapshotBorrowRate,
  getSnapshotCollateralRebasingYieldRate,
  LAST_MONTH,
} from '@/llamalend/rates.utils'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { networks } from '@/loan/networks'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'

type UseMarketDetailsProps = {
  chainId: ChainId
  market: Llamma | null | undefined
  marketId: string
}

export const useMarketDetails = ({ chainId, market, marketId }: UseMarketDetailsProps): MarketDetailsProps => {
  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({ chainId, marketId })
  const blockchainId = networks[chainId]?.id
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.controller?.toLocaleLowerCase() as Address,
  })
  const { data: collateralUsdRate, isLoading: collateralUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: market?.collateral,
  })
  const { data: borrowedUsdRate, isLoading: borrowedUsdRateLoading } = useTokenUsdRate({
    chainId,
    tokenAddress: CRVUSD_ADDRESS,
  })
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId,
    contractAddress: market?.controller as Address,
    agg: 'day',
    limit: LAST_MONTH, // fetch last 30 days for 30 day average calcs
  })
  const { data: capAndAvailable, isLoading: isCapAndAvailableLoading } = useMarketCapAndAvailable({ chainId, marketId })
  const { data: totalCollateral, isLoading: isTotalCollateralLoading } = useMarketTotalCollateral({ chainId, marketId })
  const borrowApr = marketRates?.borrowApr == null ? null : Number(marketRates.borrowApr)
  const {
    averageRate,
    averageRebasingYield,
    totalRate: totalBorrowRate,
    averageTotalRate: totalAverageBorrowRate,
    rebasingYield: collateralRebasingYieldApr,
  } = useMemo(
    () =>
      getBorrowRateMetrics({
        borrowRate: borrowApr,
        snapshots: crvUsdSnapshots,
        getBorrowRate: getSnapshotBorrowRate,
        getRebasingYield: getSnapshotCollateralRebasingYieldRate,
      }),
    [borrowApr, crvUsdSnapshots],
  )

  // Query validation only checks param presence (chain/market/user). We still need `!market`
  // because this hook runs before market metadata is available, and the UI reads market fields.
  const isMarketMetadataLoading = !market

  const totalCollateralValue = totalCollateral == null ? null : Number(totalCollateral)

  return {
    marketType: LlamaMarketType.Mint,
    blockchainId,
    collateral: {
      symbol: market?.collateralSymbol ?? null,
      tokenAddress: market?.collateral,
      total: totalCollateralValue,
      totalUsdValue:
        totalCollateralValue != null && collateralUsdRate != null ? totalCollateralValue * collateralUsdRate : null,
      usdRate: collateralUsdRate ? Number(collateralUsdRate) : null,
      loading: collateralUsdRateLoading || isTotalCollateralLoading || isMarketMetadataLoading,
    },
    borrowToken: {
      symbol: 'crvUSD',
      tokenAddress: CRVUSD_ADDRESS,
      usdRate: borrowedUsdRate ? Number(borrowedUsdRate) : null,
      loading: borrowedUsdRateLoading || isMarketMetadataLoading,
    },
    borrowRate: {
      rate: borrowApr,
      averageRate,
      averageRateLabel: `${LAST_MONTH}D`,
      rebasingYield: collateralRebasingYieldApr,
      averageRebasingYield,
      totalAverageBorrowRate,
      extraRewards: campaigns,
      totalBorrowRate,
      loading: isSnapshotsLoading || isMarketRatesLoading || isMarketMetadataLoading,
    },
    availableLiquidity: {
      value: capAndAvailable?.available == null ? null : Number(capAndAvailable.available),
      max: capAndAvailable?.cap == null ? null : Number(capAndAvailable.cap),
      loading: isCapAndAvailableLoading || isMarketMetadataLoading,
    },
  }
}
