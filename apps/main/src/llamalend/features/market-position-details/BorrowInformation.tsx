import { getCollateralValue, getLoanToValue } from '@/llamalend/equity-leverage.utils'
import { useMarketContext } from '@/llamalend/features/market-context'
import {
  formatDistanceToRange,
  formatRangePrices,
  getBandCount,
  getDistanceToRange,
  getPositionHealthThresholds,
} from '@/llamalend/health.utils'
import { useCarryApr } from '@/llamalend/hooks/useCarryApr'
import { useEquityLeverage } from '@/llamalend/hooks/useEquityLeverage'
import { usePositionPnlAndEquity } from '@/llamalend/hooks/usePositionPnlAndEquity'
import { tokenMetric, type MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market/market-oracle-price.query'
import { useUserBands } from '@/llamalend/queries/user/user-bands.query'
import { usePositionHealth } from '@/llamalend/queries/user/user-health.query'
import { useUserPrices } from '@/llamalend/queries/user/user-prices.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import { CarryAprTooltipContent } from '@/llamalend/widgets/tooltips/CarryAprTooltipContent'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { LeverageTooltipContent } from '@/llamalend/widgets/tooltips/LeverageTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { usePositionDetailsOpen } from '@ui/features/storage/useLocalStorage'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimalMultiply } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { getTokenPairUnit, UNAVAILABLE_TOKEN_SYMBOL } from '@ui/lib/tokens'
import { HealthDetails } from './health/HealthDetails'
import { BORROW_METRIC_CATEGORY, BORROW_METRIC_TOOLTIP, getLeverageValueColor } from './market-position-details.utils'
import { PnlMetrics } from './PnlMetrics'
import { DistanceToRangeTooltipContent } from './tooltips/DistanceToRangeTooltipContent'

const { Spacing, Grid } = SizesAndSpaces

/** The metrics turn into full-width rows on mobile, so they stack in one column there */
const GRID_SX = {
  gridTemplateColumns: { mobile: 'minmax(0, 1fr)', tablet: 'repeat(4, minmax(0, 1fr))' },
  rowGap: { ...Grid.Row_Spacing, mobile: 0 },
}

/** Every metric of the main grid sets its `gridArea`, so a missing metric leaves its slot empty instead of reflowing the rest. */
const MAIN_GRID_AREAS = {
  mobile: `"health" "range" "buffer" "leverage" "carry" "equity" "pnl"`,
  tablet: `"health range leverage equity" "health buffer carry pnl"`,
}

type BorrowInformationProps = { params: UserMarketParams; tokens: MarketTokensOrEmpty }

/** The borrow position metrics of the new health. It relies on the beta channel features: equity leverage, carry APR and PNL. */
export const BorrowInformation = ({ params, tokens: { collateralToken, borrowToken } }: BorrowInformationProps) => {
  const { chainId, controllerAddress } = useMarketContext()
  const [isDetailsOpen] = usePositionDetailsOpen()
  const thresholds = getPositionHealthThresholds(getMarketAssetsType(chainId, controllerAddress))
  const position = usePositionHealth(params, thresholds)
  const userState = useUserState(params)
  const equityLeverage = useEquityLeverage({ params })
  const carryApr = useCarryApr({ params })
  const positionPnl = usePositionPnlAndEquity(params)
  const oraclePrice = useMarketOraclePrice(params)
  const userPrices = useUserPrices(params)
  const userBands = useUserBands(params)
  const borrowUsdRate = useTokenUsdRate({ chainId: params.chainId, tokenAddress: borrowToken?.address })

  const { collateral, convertedBorrowed: borrowed } = userState.data ?? {}
  const collateralValue = combineQueries([oraclePrice, userState], (oraclePrice, userState) =>
    getCollateralValue(userState, oraclePrice),
  )
  const loanToValue = combineQueries([userState, oraclePrice], (userState, oraclePrice) =>
    getLoanToValue(userState.debt, getCollateralValue(userState, oraclePrice)),
  )
  const distanceToRange = combineQueries([oraclePrice, userPrices], (oraclePrice, prices) =>
    maybe(prices, prices => getDistanceToRange(oraclePrice, prices)),
  )
  const borrowSymbol = borrowToken?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL
  const priceUnit = getTokenPairUnit([collateralToken?.symbol, borrowToken?.symbol])

  return (
    <Stack>
      <MetricsGrid sx={{ ...GRID_SX, gridTemplateAreas: MAIN_GRID_AREAS }}>
        <HealthDetails
          position={position}
          thresholds={thresholds}
          borrowSymbol={borrowToken?.symbol}
          showAmount={isDetailsOpen}
        />
        <Metric
          category={BORROW_METRIC_CATEGORY}
          label={t`Distance to range`}
          value={distanceToRange}
          valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION, formatter: formatDistanceToRange }}
          valueTooltip={{
            title: t`Distance to range`,
            body: <DistanceToRangeTooltipContent userPrices={q(userPrices)} params={params} priceUnit={priceUnit} />,
            ...BORROW_METRIC_TOOLTIP,
          }}
          notional={isDetailsOpen ? mapQuery(userPrices, prices => maybe(prices, formatRangePrices)) : undefined}
          sx={{ gridArea: 'range' }}
        />
        {equityLeverage && (
          <Metric
            category={BORROW_METRIC_CATEGORY}
            label={t`Leverage`}
            value={equityLeverage.current}
            valueOptions={{
              unit: 'multiplier',
              fallback: UNAVAILABLE_NOTATION,
              color: getLeverageValueColor(equityLeverage.current.data),
            }}
            valueTooltip={{
              title: t`Leverage`,
              body: <LeverageTooltipContent openingLeverage={equityLeverage.opening} />,
              ...BORROW_METRIC_TOOLTIP,
            }}
            sx={{ gridArea: 'leverage' }}
          />
        )}
        {carryApr && (
          <Metric
            category={BORROW_METRIC_CATEGORY}
            label={t`Carry APR`}
            value={carryApr.current}
            valueOptions={{ unit: 'percentage', fallback: UNAVAILABLE_NOTATION }}
            valueTooltip={{ title: t`Carry APR`, body: <CarryAprTooltipContent />, ...BORROW_METRIC_TOOLTIP }}
            notional={
              isDetailsOpen
                ? mapQuery(carryApr.yieldMultiplier, multiplier =>
                    maybe(multiplier, value => `${formatNumber(value, 'multiplier')} ${t`yield`}`),
                  )
                : undefined
            }
            sx={{ gridArea: 'carry' }}
          />
        )}
        {positionPnl && (
          <PnlMetrics
            {...positionPnl}
            borrowSymbol={borrowToken?.symbol}
            collateralSymbol={collateralToken?.symbol}
            borrowUsdRate={q(borrowUsdRate)}
            showNotional={isDetailsOpen}
          />
        )}
      </MetricsGrid>
      <Collapse in={isDetailsOpen}>
        <MetricsGrid sx={{ ...GRID_SX, paddingBlockStart: Spacing.sm }}>
          <Metric
            category={BORROW_METRIC_CATEGORY}
            label={t`Collateral value`}
            {...tokenMetric({ value: collateralValue, symbol: borrowSymbol, usdRate: q(borrowUsdRate) })}
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
              ...BORROW_METRIC_TOOLTIP,
            }}
          />
          <Metric
            category={BORROW_METRIC_CATEGORY}
            label={t`Total debt`}
            {...tokenMetric({
              value: mapQuery(userState, ({ debt }) => debt),
              symbol: borrowToken?.symbol,
              usdRate: q(borrowUsdRate),
            })}
            valueTooltip={{ title: t`Total Debt`, body: <TotalDebtTooltipContent />, ...BORROW_METRIC_TOOLTIP }}
          />
          <Metric
            category={BORROW_METRIC_CATEGORY}
            label={t`LTV ratio`}
            value={loanToValue}
            valueOptions={{
              abbreviate: false,
              fallback: UNAVAILABLE_NOTATION,
              formatter: value => formatNumber(value, 'percent.rate'),
            }}
            valueTooltip={{ title: t`LTV`, body: <CurrentLTVTooltipContent />, ...BORROW_METRIC_TOOLTIP }}
          />
          <Metric
            category={BORROW_METRIC_CATEGORY}
            label={t`Bands`}
            value={mapQuery(userBands, getBandCount)}
            valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION }}
          />
        </MetricsGrid>
      </Collapse>
    </Stack>
  )
}
