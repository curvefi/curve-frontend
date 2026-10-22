import {
  formatCollateralNotional,
  isPositionLeveraged,
  tokenMetric,
  type MarketTokensOrEmpty,
} from '@/llamalend/llama.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { useUserCurrentLeverage } from '@/llamalend/queries/user/user-current-leverage.query'
import { useRangeToLiquidation } from '@/llamalend/queries/user/user-prices.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import { useEquityLeverage } from '@/llamalend/widgets/action-card/hooks/useEquityLeverage'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { LeverageTooltipContent } from '@/llamalend/widgets/tooltips/LeverageTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { getTokenPairUnit, UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { getLeverageValueColor } from './market-position-details.utils'
import { LiquidationThresholdTooltipContent } from './tooltips/LiquidationThresholdMetricTooltipContent'

const METRIC_CATEGORY = 'llamalend.positionBorrowDetails'
const METRIC_TOOLTIP = { placement: 'top', arrow: false, clickable: true } as const

type BorrowInformationProps = { params: UserMarketParams; tokens: MarketTokensOrEmpty }

export const BorrowInformation = ({ params, tokens: { collateralToken, borrowToken } }: BorrowInformationProps) => {
  const userState = useUserState(params)
  const { data: userStateValue } = userState
  const isEquityLeverage = useLlamalendEquityLeverage()
  const collateralLeverage = useUserCurrentLeverage(params)
  const equityLeverage = useEquityLeverage({ params }, isEquityLeverage)
  const leverage = isEquityLeverage
    ? equityLeverage?.current
    : isPositionLeveraged(collateralLeverage.data) && q(collateralLeverage)
  const oraclePrice = useMarketOraclePrice(params)
  const borrowUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: borrowToken?.address })

  const { collateral, stablecoin: borrowed } = userStateValue ?? {}
  const collateralValue = combineQueries([oraclePrice, userState], (oraclePrice, userState) =>
    decimalSum(decimalMultiply(userState.collateral, oraclePrice), userState.stablecoin),
  )
  const { rangeToLiquidation, userPrices } = useRangeToLiquidation({ params })
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const priceUnit = getTokenPairUnit([collateralToken?.symbol, borrowToken?.symbol])

  return (
    <MetricsGrid variant="mobileRows">
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
          ...METRIC_TOOLTIP,
        }}
      />
      <Metric
        category={METRIC_CATEGORY}
        label={t`Total debt`}
        {...tokenMetric({
          value: mapQuery(userState, ({ debt }) => debt),
          symbol: borrowToken?.symbol,
          usdRate: q(borrowUsdRate),
        })}
        valueTooltip={{ title: t`Total Debt`, body: <TotalDebtTooltipContent />, ...METRIC_TOOLTIP }}
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
          ...METRIC_TOOLTIP,
        }}
        notional={mapQuery(rangeToLiquidation, v =>
          maybe(v, value => ({ value, unit: { symbol: `% distance to LT`, position: 'suffix' as const } })),
        )}
      />
      {leverage && (
        <Metric
          category={METRIC_CATEGORY}
          label={t`Leverage`}
          value={leverage}
          valueOptions={{ unit: 'multiplier', fallback: '-', color: getLeverageValueColor(leverage.data) }}
          valueTooltip={
            isEquityLeverage ? { title: t`Leverage`, body: <LeverageTooltipContent />, ...METRIC_TOOLTIP } : undefined
          }
        />
      )}
    </MetricsGrid>
  )
}
