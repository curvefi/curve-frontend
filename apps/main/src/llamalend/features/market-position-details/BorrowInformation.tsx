import { formatCollateralNotional, isPositionLeveraged, type MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserCurrentLeverage, useUserState } from '@/llamalend/queries/user'
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
import { mapQuery, q } from '@ui-kit/types/util'
import { decimalMultiply, decimalSum, UNAVAILABLE_TOKEN_SYMBOL } from '@ui-kit/utils'
import { LiquidationThresholdTooltipContent } from './'

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'

type BorrowInformationProps = {
  params: UserMarketParams
  tokens: MarketTokensOrEmpty
}

export const BorrowInformation = ({ params, tokens: { collateralToken, borrowToken } }: BorrowInformationProps) => {
  const userState = useUserState(params)
  const { data: userStateValue } = userState
  const leverage = useUserCurrentLeverage(params)
  const oraclePrice = useMarketOraclePrice(params)
  const borrowUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: borrowToken?.address })

  const { collateral, stablecoin: borrowed } = userStateValue ?? {}
  const collateralValue = combineQueries([oraclePrice, userState], (oraclePrice, userState) =>
    decimalSum(decimalMultiply(userState.collateral, oraclePrice), userState.stablecoin),
  )
  const { rangeToLiquidation, userPrices } = useRangeToLiquidation({ params })
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const priceUnit = `${collateralToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL}/${borrowSymbol}`

  return (
    <Stack>
      <Stack
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { mobile: 'repeat(1, 1fr)', tablet: 'repeat(4, 1fr)', desktop: 'repeat(5, 1fr)' },
        }}
      >
        <Metric
          category={METRIC_CATEGORY}
          label={t`Collateral value`}
          value={collateralValue}
          valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
          notional={mapQuery(userState, ({ collateral, stablecoin }) =>
            formatCollateralNotional(
              { value: collateral, symbol: collateralToken?.symbol },
              { value: stablecoin, symbol: borrowToken?.symbol },
            ),
          )}
          valueTooltip={{
            title: t`Collateral value`,
            body: (
              <CollateralMetricTooltipContent
                borrow={{ value: borrowed, symbol: borrowToken?.symbol }}
                collateral={{ value: collateral, conversionRate: oraclePrice.data, symbol: collateralToken?.symbol }}
                totalValue={collateralValue.data}
                totalValueUsd={combineQueries([collateralValue, borrowUsdRate], (totalValue, borrowUsdRate) =>
                  decimalMultiply(totalValue, borrowUsdRate),
                )}
              />
            ),
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          category={METRIC_CATEGORY}
          label={t`Total debt`}
          value={mapQuery(userState, ({ debt }) => debt)}
          valueOptions={{ unit: { symbol: borrowSymbol, position: 'suffix' } }}
          valueTooltip={{
            title: t`Total Debt`,
            body: <TotalDebtTooltipContent />,
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
        />
        <Metric
          category={METRIC_CATEGORY}
          label={t`Liquidation threshold`}
          value={mapQuery(userPrices, p => p?.[1])}
          valueOptions={{ abbreviate: false, unit: { symbol: priceUnit, position: 'suffix' } }}
          valueTooltip={{
            title: t`Liquidation Threshold (LT)`,
            body: (
              <LiquidationThresholdTooltipContent
                userPrices={q(userPrices)}
                rangeToLiquidation={rangeToLiquidation}
                params={params}
                priceUnit={priceUnit}
              />
            ),
            placement: 'top',
            arrow: false,
            clickable: true,
          }}
          notional={mapQuery(rangeToLiquidation, v =>
            maybe(v, value => ({ value, unit: { symbol: `% distance to LT`, position: 'suffix' as const } })),
          )}
        />
        {isPositionLeveraged(leverage.data) && (
          <Metric
            category={METRIC_CATEGORY}
            label={t`Leverage`}
            value={q(leverage)}
            valueOptions={{ unit: 'multiplier' }}
          />
        )}
      </Stack>
    </Stack>
  )
}
