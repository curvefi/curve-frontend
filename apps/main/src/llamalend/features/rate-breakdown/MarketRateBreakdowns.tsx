import { useMemo } from 'react'
import { useMarketContext } from '@/llamalend/features/market-context'
import { usePageHeaderRates } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketRateType } from '@evm-ui/types/market'
import { mapQuery } from '@evm-ui/types/util'
import { Chain, MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { buildBorrowRateBreakdown, buildSupplyRateBreakdown } from './market-rate-breakdown.utils'
import { PointsCampaignsTable, RateBreakdownTable } from './MarketRateBreakdownCards'

const { Spacing } = SizesAndSpaces

export const MarketRateBreakdowns = ({ hideSupply = false }: { hideSupply?: boolean }) => {
  const {
    chainId,
    blockchainId,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext()
  const { borrowRate, supplyRate } = usePageHeaderRates()
  const addresses = useMemo(
    () =>
      notFalsy(
        collateralToken?.address,
        ...(borrowRate.data?.extraRewards.map(({ reward }) => reward?.type === 'apr' && reward.address) ?? []),
        !hideSupply && borrowToken?.address,
        ...(supplyRate?.data?.extraIncentives.map(
          ({ address }) => !hideSupply && address.toLowerCase() !== MAINNET_CRV_ADDRESS && address,
        ) ?? []),
        ...(supplyRate?.data?.extraRewards.map(
          ({ reward }) => !hideSupply && reward?.type === 'apr' && reward.address,
        ) ?? []),
      ),
    [borrowRate.data?.extraRewards, borrowToken, collateralToken, hideSupply, supplyRate?.data],
  )
  const { data: prices } = useTokenUsdRates({ chainId, tokenAddresses: addresses }, addresses.length > 0)
  const { data: crvPrice } = useTokenUsdRate({
    chainId: Chain.Ethereum,
    tokenAddress: hideSupply ? undefined : MAINNET_CRV_ADDRESS,
  })
  const borrowQuery = mapQuery(borrowRate, rate =>
    buildBorrowRateBreakdown({ rate, chainId, blockchainId, collateralToken, prices }),
  )
  const supplyQuery =
    !hideSupply && supplyRate
      ? mapQuery(supplyRate, rate =>
          buildSupplyRateBreakdown({ rate, chainId, blockchainId, borrowToken, prices, crvPrice }),
        )
      : undefined

  return (
    <Stack sx={{ gap: Spacing.md }}>
      <Stack>
        <RateBreakdownTable rateType={MarketRateType.Borrow} query={borrowQuery} />
        {!!borrowQuery.data?.points.length && (
          <PointsCampaignsTable rateType={MarketRateType.Borrow} rows={borrowQuery.data.points} />
        )}
      </Stack>
      {supplyQuery && (
        <Stack>
          <RateBreakdownTable rateType={MarketRateType.Supply} query={supplyQuery} />
          {!!supplyQuery.data?.points.length && (
            <PointsCampaignsTable rateType={MarketRateType.Supply} rows={supplyQuery.data.points} />
          )}
        </Stack>
      )}
    </Stack>
  )
}
