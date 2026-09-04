import { useMemo } from 'react'
import { useMarketContext } from '@/llamalend/features/market-context'
import { usePageHeaderRates } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { MarketRateType } from '@evm-ui/types/market'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { Chain } from '@primitives/network.utils'
import { notFalsy } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'
import { stackedMarketCardHeadersSx } from '@ui/utils/mui'
import { buildBorrowRateBreakdown, buildSupplyRateBreakdown } from './market-rate-breakdown.utils'
import { PointsCampaignsCard, RateBreakdownTable } from './MarketRateBreakdownCards'

export const MarketBorrowRateBreakdown = () => {
  const {
    chainId,
    blockchainId,
    tokens: { collateralToken },
  } = useMarketContext()
  const { borrowRate } = usePageHeaderRates()
  const addresses = useMemo(
    () =>
      notFalsy(
        collateralToken?.address,
        ...(borrowRate.data?.extraRewards.map(({ reward }) => reward?.type === 'apr' && reward.address) ?? []),
      ),
    [borrowRate.data?.extraRewards, collateralToken?.address],
  )
  const { data: prices } = useTokenUsdRates({ chainId, tokenAddresses: addresses }, addresses.length > 0)
  const borrowQuery = mapQuery(borrowRate, rate =>
    buildBorrowRateBreakdown({ rate, chainId, blockchainId, collateralToken, prices }),
  )

  return (
    <>
      <RateBreakdownTable rateType={MarketRateType.Borrow} query={borrowQuery} />
      {!!borrowQuery.data?.points.length && (
        <PointsCampaignsCard rateType={MarketRateType.Borrow} rows={borrowQuery.data.points} />
      )}
    </>
  )
}

export const MarketSupplyRateBreakdown = () => {
  const {
    chainId,
    blockchainId,
    tokens: { borrowToken },
  } = useMarketContext()
  const { supplyRate } = usePageHeaderRates()
  const addresses = useMemo(
    () =>
      notFalsy(
        borrowToken?.address,
        ...(supplyRate?.data?.extraIncentives.map(
          ({ address }) => address.toLowerCase() !== MAINNET_CRV_ADDRESS && address,
        ) ?? []),
        ...(supplyRate?.data?.extraRewards.map(({ reward }) => reward?.type === 'apr' && reward.address) ?? []),
      ),
    [borrowToken?.address, supplyRate?.data],
  )
  const { data: prices } = useTokenUsdRates({ chainId, tokenAddresses: addresses }, addresses.length > 0)
  const { data: crvPrice } = useTokenUsdRate({ chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS })

  if (!supplyRate) return null

  const supplyQuery = mapQuery(supplyRate, rate =>
    buildSupplyRateBreakdown({ rate, chainId, blockchainId, borrowToken, prices, crvPrice }),
  )

  return (
    <Stack sx={stackedMarketCardHeadersSx}>
      <RateBreakdownTable rateType={MarketRateType.Supply} query={supplyQuery} />
      {!!supplyQuery.data?.points.length && (
        <PointsCampaignsCard rateType={MarketRateType.Supply} rows={supplyQuery.data.points} />
      )}
    </Stack>
  )
}
