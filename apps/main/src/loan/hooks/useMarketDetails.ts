import { last } from 'lodash'
import { useMemo } from 'react'
import type { MarketDetailsProps } from '@/llamalend/features/market-details'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useMintMarketMaxLeverage } from '@/loan/entities/mint-market-max-leverage'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { Address } from '@curvefi/prices-api'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { useCrvUsdSnapshots } from '@ui-kit/entities/crvusd-snapshots'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

type UseMarketDetailsProps = {
  chainId: ChainId
  llamma: Llamma | null | undefined
  llammaId: string
}

const averageMultiplier = 30
const averageMultiplierString = `${averageMultiplier}D`

export const useMarketDetails = ({ chainId, llamma, llammaId }: UseMarketDetailsProps): MarketDetailsProps => {
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
    limit: 30, // fetch last 30 days for 30 day average calcs
  })
  const { data: maxLeverage, isLoading: isMarketMaxLeverageLoading } = useMintMarketMaxLeverage({
    chainId,
    marketId: llammaId,
  })
  const { rate: averageRate, rebasingYield: averageRebasingYield } = useMemo(
    () =>
      calculateAverageRates(crvUsdSnapshots, averageMultiplier, {
        rate: ({ rate }) => rate * 100,
        rebasingYield: ({ collateralToken }) => collateralToken.rebasingYield,
      }) ?? { rate: null, rebasingYield: null },
    [crvUsdSnapshots],
  )

  const totalAverageBorrowRate = averageRate == null ? null : averageRate - (averageRebasingYield ?? 0)

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
    borrowAPY: {
      rate: loanDetails?.parameters?.rate ? Number(loanDetails?.parameters?.rate) : null,
      futureRate: loanDetails?.parameters?.future_rate ? Number(loanDetails?.parameters?.future_rate) : null,
      averageRate: averageRate,
      averageRateLabel: averageMultiplierString,
      rebasingYield: last(crvUsdSnapshots)?.collateralToken.rebasingYield ?? null,
      averageRebasingYield: averageRebasingYield ?? null,
      totalAverageBorrowRate,
      extraRewards: campaigns,
      totalBorrowRate: loanDetails?.parameters?.rate
        ? Number(loanDetails?.parameters?.rate) - (last(crvUsdSnapshots)?.collateralToken.rebasingYield ?? 0)
        : null,
      loading: isSnapshotsLoading || (loanDetails?.loading ?? true),
    },
    maxLeverage: {
      value: maxLeverage,
      loading: isMarketMaxLeverageLoading,
    },
    availableLiquidity: {
      value: loanDetails?.capAndAvailable?.available ? Number(loanDetails.capAndAvailable.available) : null,
      max: loanDetails?.capAndAvailable?.cap ? Number(loanDetails.capAndAvailable.cap) : null,
      loading: loanDetails?.loading ?? true,
    },
  }
}
