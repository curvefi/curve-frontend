import { useMemo } from 'react'
import { useMarketContext } from '@/llamalend/features/market-context'
import { usePageHeaderRates } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { MarketRateType } from '@evm-ui/types/market'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { Chain } from '@primitives/network.utils'
import { notFalsy, notFalsyArray } from '@primitives/objects.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { stackedCardHeadersSx } from '@ui/lib/mui'
import { buildBorrowRateBreakdown, buildSupplyRateBreakdown } from './market-rate-breakdown.utils'
import { PointsCampaignsCard, RateBreakdownTable } from './MarketRateBreakdownCards'

export const MarketBorrowRateBreakdown = () => {
  const {
    chainId,
    blockchainId,
    tokens: { collateralToken },
  } = useMarketContext()
  const { borrowRate } = usePageHeaderRates()
  const collateralPrice = q(
    useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address }, borrowRate.data?.rebasingYield != null),
  )
  const borrowQuery = mapQuery(borrowRate, rate =>
    buildBorrowRateBreakdown({ rate, chainId, blockchainId, collateralToken, collateralPrice }),
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
        supplyRate?.data?.rebasingYield != null && borrowToken?.address,
        ...notFalsyArray(
          supplyRate?.data?.extraIncentives.map(
            ({ address }) => address.toLowerCase() !== MAINNET_CRV_ADDRESS && address,
          ),
        ),
      ),
    [borrowToken?.address, supplyRate?.data],
  )
  const prices = useTokenUsdRates({ chainId, tokenAddresses: addresses })
  const crvPrice = q(
    useTokenUsdRate(
      { chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS },
      !!(supplyRate?.data?.supplyApyCrvMinBoost || supplyRate?.data?.supplyApyCrvMaxBoost),
    ),
  )
  if (!supplyRate) return null

  const supplyQuery = mapQuery(supplyRate, rate =>
    buildSupplyRateBreakdown({ rate, chainId, blockchainId, borrowToken, prices, crvPrice }),
  )

  return (
    <Stack sx={stackedCardHeadersSx}>
      <RateBreakdownTable rateType={MarketRateType.Supply} query={supplyQuery} />
      {!!supplyQuery.data?.points.length && (
        <PointsCampaignsCard rateType={MarketRateType.Supply} rows={supplyQuery.data.points} />
      )}
    </Stack>
  )
}
