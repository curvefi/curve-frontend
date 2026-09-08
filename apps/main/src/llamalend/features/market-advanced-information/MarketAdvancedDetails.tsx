import { formatCollateralNotional, tokenMetric } from '@/llamalend/llama.utils'
import {
  MaxLeverageTooltip,
  SolvencyTooltip,
  TotalCollateralTooltip,
  TooltipOptions,
} from '@/llamalend/widgets/tooltips'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { MarketType } from '@evm-ui/types/market'
import { decimal } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../market-context'
import { useAdvancedDetailsData } from './hooks/useAdvancedDetailsData'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketAdvancedDetails'

export const MarketAdvancedDetails = () => {
  const { chainId, marketId, marketQuery, marketType, apiMarket } = useMarketContext()
  const { borrowedUsdRate, collateral, availableLiquidity, tvl, maxLeverage, solvency, totalBorrowers } =
    useAdvancedDetailsData({
      chainId,
      marketQuery,
      marketId,
      marketType,
      apiMarket,
    })
  const isLendMarket = marketType === MarketType.Lend

  return (
    <Box
      data-testid="market-advanced-details-metrics"
      sx={{
        display: 'grid',
        gap: { ...Spacing.lg, mobile: 0 },
        gridTemplateColumns: {
          mobile: 'repeat(1, minmax(0, 1fr))',
          tablet: 'repeat(4, minmax(0, 1fr))',
          desktop: 'repeat(6, minmax(0, 1fr))',
        },
      }}
    >
      <Metric
        category={METRIC_CATEGORY}
        testId="market-tvl"
        label={t`TVL`}
        value={mapQuery(tvl, ({ value }) => value)}
        valueOptions={{ unit: 'dollar' }}
      />
      {availableLiquidity.data?.borrowCap && (
        <Metric
          category={METRIC_CATEGORY}
          label={t`Borrow cap`}
          labelTooltip={{ title: t`The maximum total amount that can be borrowed from this market.` }}
          {...tokenMetric({
            value: mapQuery(availableLiquidity, d => d.borrowCap),
            symbol: availableLiquidity.data?.borrowSymbol,
            usdRate: borrowedUsdRate,
          })}
        />
      )}
      <Metric
        category={METRIC_CATEGORY}
        testId="market-total-borrowers"
        label={t`Total borrowers`}
        value={totalBorrowers}
        valueOptions={{ abbreviate: true }}
      />
      {/* we show total collateral in the rate curve card for lend markets */}
      {!isLendMarket && (
        <Metric
          category={METRIC_CATEGORY}
          testId="market-total-collateral"
          label={t`Total collateral`}
          value={mapQuery(collateral, ({ combinedCollateralUsdValue }) => combinedCollateralUsdValue)}
          valueOptions={{ unit: 'dollar' }}
          notional={mapQuery(collateral, ({ borrowedSymbol, collateralSymbol, totalBorrowed, totalCollateral }) =>
            formatCollateralNotional(
              { value: decimal(totalCollateral), symbol: collateralSymbol },
              { value: decimal(totalBorrowed), symbol: borrowedSymbol },
            ),
          )}
          valueTooltip={{
            title: t`Total Collateral`,
            body: <TotalCollateralTooltip {...collateral.data} />,
            ...TooltipOptions,
          }}
        />
      )}
      {solvency && (
        <Metric
          category={METRIC_CATEGORY}
          label={t`Solvency`}
          value={mapQuery(solvency, ({ value }) => value)}
          valueOptions={{ unit: 'percentage' }}
          valueTooltip={{
            title: t`Solvency`,
            body: <SolvencyTooltip type={marketType} />,
            ...TooltipOptions,
          }}
        />
      )}
      {maxLeverage && (
        <Metric
          category={METRIC_CATEGORY}
          label={t`Max leverage`}
          value={mapQuery(maxLeverage, ({ value }) => value)}
          valueOptions={{ unit: 'multiplier' }}
          valueTooltip={{
            title: t`Maximum Leverage`,
            body: <MaxLeverageTooltip />,
            ...TooltipOptions,
          }}
        />
      )}
    </Box>
  )
}
