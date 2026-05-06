import { useMemo } from 'react'
import { formatCollateralNotional, getTokens, isPositionLeveraged } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type UserState, useUserCurrentLeverage, useUserState } from '@/llamalend/queries/user'
import { useRangeToLiquidation } from '@/llamalend/queries/user/user-prices.query'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import { Stack } from '@mui/material'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { q, type Query } from '@ui-kit/types/util'
import { decimalMultiply, decimalSum } from '@ui-kit/utils'
import { LiquidationThresholdTooltipContent } from './'

const dollarUnitOptions = {
  abbreviate: false,
  unit: {
    symbol: '$',
    position: 'prefix' as const,
    abbreviate: false,
  },
}

type BorrowInformationProps = {
  params: UserMarketParams
  market: LlamaMarketTemplate | undefined
}

const useCollateralValue = ({
  userState,
  collateralUsdRate,
}: {
  userState: Query<UserState>
  collateralUsdRate: Query<number>
}) => ({
  data: useMemo(
    () =>
      collateralUsdRate.data && userState.data
        ? decimalSum(decimalMultiply(userState.data.collateral, `${collateralUsdRate.data}`), userState.data.stablecoin)
        : null,
    [userState.data, collateralUsdRate.data],
  ),
  ...combineQueryState(collateralUsdRate, userState),
})

export const BorrowInformation = ({ params, market }: BorrowInformationProps) => {
  const userState = useUserState(params)
  const { data: userStateValue, isLoading: isUserStateLoading } = userState
  const { data: leverageValue, isLoading: isLeverageLoading } = useUserCurrentLeverage(params)

  const { collateralToken, borrowToken } = market ? getTokens(market) : {}
  const collateralUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: collateralToken?.address })
  const borrowedUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: borrowToken?.address })

  const { collateral, stablecoin: borrowed, debt } = userStateValue ?? {}
  const collateralV = useCollateralValue({ userState, collateralUsdRate })
  const { rangeToLiquidation, userPrices } = useRangeToLiquidation({ params })

  return (
    <Stack>
      <Stack
        display="grid"
        gap={3}
        sx={{
          gridTemplateColumns: { mobile: '1fr 1fr', desktop: 'repeat(4, 1fr)' },
        }}
      >
        <Metric
          size="small"
          label={t`Collateral value`}
          value={collateralV.data}
          loading={collateralV.isLoading}
          error={collateralV.error}
          valueOptions={{ unit: 'dollar' }}
          notional={
            collateral
              ? formatCollateralNotional(
                  { value: collateral, symbol: collateralToken?.symbol },
                  { value: borrowed, symbol: borrowToken?.symbol },
                )
              : undefined
          }
          valueTooltip={{
            title: t`Collateral value`,
            body: (
              <CollateralMetricTooltipContent
                borrow={{ value: borrowed, usdRate: borrowedUsdRate.data, symbol: borrowToken?.symbol }}
                collateral={{ value: collateral, usdRate: collateralUsdRate.data, symbol: collateralToken?.symbol }}
                totalValue={collateralV.data}
              />
            ),
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          size="small"
          label={t`Liquidation threshold`}
          value={userPrices?.data?.[1]}
          loading={userPrices?.isLoading}
          valueOptions={dollarUnitOptions}
          valueTooltip={{
            title: t`Liquidation Threshold (LT)`,
            body: (
              <LiquidationThresholdTooltipContent
                userPrices={q(userPrices)}
                rangeToLiquidation={rangeToLiquidation}
                params={params}
              />
            ),
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
          notional={
            rangeToLiquidation.data
              ? {
                  value: rangeToLiquidation.data,
                  unit: { symbol: `% distance to LT`, position: 'suffix' },
                }
              : undefined
          }
        />
        <Metric
          size="small"
          label={t`Total debt`}
          value={debt}
          loading={isUserStateLoading}
          valueOptions={{ unit: { symbol: borrowToken?.symbol ?? '?', position: 'suffix' } }}
          valueTooltip={{
            title: t`Total Debt`,
            body: <TotalDebtTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        {isPositionLeveraged(leverageValue) && (
          <Metric
            size="small"
            label={t`Leverage`}
            value={leverageValue}
            loading={isLeverageLoading}
            valueOptions={{ unit: 'multiplier' }}
          />
        )}
      </Stack>
    </Stack>
  )
}
