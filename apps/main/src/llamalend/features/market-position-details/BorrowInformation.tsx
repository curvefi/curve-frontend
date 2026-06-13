import { formatCollateralNotional, isPositionLeveraged, type MarketTokens } from '@/llamalend/llama.utils'
import { type UserState, useUserCurrentLeverage, useUserState } from '@/llamalend/queries/user'
import { useRangeToLiquidation } from '@/llamalend/queries/user/user-prices.query'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import { Stack } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { combineQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { mapQuery, q, type Query } from '@ui-kit/types/util'
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
  tokens: Partial<MarketTokens>
}

const getCollateralValue = ({
  userState,
  collateralUsdRate,
}: {
  userState: Query<UserState>
  collateralUsdRate: Query<number>
}) =>
  combineQueries([collateralUsdRate, userState], (collateralUsdRate, userState) =>
    decimalSum(decimalMultiply(userState.collateral, `${collateralUsdRate}`), userState.stablecoin),
  )

export const BorrowInformation = ({ params, tokens: { collateralToken, borrowToken } }: BorrowInformationProps) => {
  const userState = useUserState(params)
  const { data: userStateValue } = userState
  const leverage = useUserCurrentLeverage(params)

  const collateralUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: collateralToken?.address })
  const borrowedUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: borrowToken?.address })

  const { collateral, stablecoin: borrowed } = userStateValue ?? {}
  const collateralValue = getCollateralValue({ userState, collateralUsdRate })
  const { rangeToLiquidation, userPrices } = useRangeToLiquidation({ params })

  return (
    <Stack>
      <Stack
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)', desktop: 'repeat(5, 1fr)' },
        }}
      >
        <Metric
          size="small"
          label={t`Collateral value`}
          value={collateralValue}
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
                totalValue={collateralValue.data}
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
          value={mapQuery(userPrices, ([, liquidationThreshold]) => liquidationThreshold)}
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
          notional={maybe(rangeToLiquidation.data, value => ({
            value,
            unit: { symbol: `% distance to LT`, position: 'suffix' },
          }))}
        />
        <Metric
          size="small"
          label={t`Total debt`}
          value={mapQuery(userState, ({ debt }) => debt)}
          valueOptions={{ unit: { symbol: borrowToken?.symbol ?? '?', position: 'suffix' } }}
          valueTooltip={{
            title: t`Total Debt`,
            body: <TotalDebtTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        {isPositionLeveraged(leverage.data) && (
          <Metric size="small" label={t`Leverage`} value={q(leverage)} valueOptions={{ unit: 'multiplier' }} />
        )}
      </Stack>
    </Stack>
  )
}
