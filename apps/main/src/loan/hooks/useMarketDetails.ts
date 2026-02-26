import { useMemo } from 'react'
import type { MarketDetailsProps } from '@/llamalend/features/market-details'
import {
  useMarketCapAndAvailable,
  useMarketTotalCollateral,
  useMarketMaxLeverage,
  useMarketRates,
} from '@/llamalend/queries/market'
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
  const { data: crvUsdSnapshots, isLoading: isSnapshotsLoading } = useCrvUsdSnapshots({
    blockchainId,
    contractAddress: market?.controller as Address,
    agg: 'day',
    limit: LAST_MONTH, // fetch last 30 days for 30 day average calcs
  })
  const { data: capAndAvailable, isLoading: isCapAndAvailableLoading } = useMarketCapAndAvailable({ chainId, marketId })
  const { data: totalCollateral, isLoading: isTotalCollateralLoading } = useMarketTotalCollateral({ chainId, marketId })
  const { data: maxLeverage, isLoading: isMarketMaxLeverageLoading } = useMarketMaxLeverage({
    chainId,
    marketId,
    range: market?.minBands ?? 0,
  })
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

  const totalCollateralValue = totalCollateral == null ? null : Number(totalCollateral.collateral)

  return {
    marketType: LlamaMarketType.Mint,
    blockchainId,
    collateral: {
      symbol: market?.collateralSymbol ?? null,
      tokenAddress: market?.collateral,
      total: totalCollateralValue,
      // TODO: add potential collateral value in borrowed token
      totalUsdValue:
        totalCollateralValue != null && collateralUsdRate != null ? totalCollateralValue * collateralUsdRate : null,
      loading: collateralUsdRateLoading || isTotalCollateralLoading || isMarketMetadataLoading,
    },
    borrowToken: {
      symbol: 'crvUSD',
      tokenAddress: CRVUSD_ADDRESS,
      loading: isMarketMetadataLoading,
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
    maxLeverage: {
      value: maxLeverage == null ? null : Number(maxLeverage),
      loading: isMarketMaxLeverageLoading || isMarketMetadataLoading,
    },
  }
}
