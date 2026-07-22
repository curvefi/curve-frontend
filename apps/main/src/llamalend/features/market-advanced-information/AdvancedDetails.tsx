import { formatCollateralNotional, tokenMetric } from '@/llamalend/llama.utils'
import { useMarketOraclePrice, useMarketParameters } from '@/llamalend/queries/market'
import { MarketMetricGrid } from '@/llamalend/widgets/MarketMetricGrid'
import {
  MaxLeverageTooltip,
  SolvencyTooltip,
  TotalCollateralTooltip,
  TooltipOptions,
} from '@/llamalend/widgets/tooltips'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketType } from '@ui-kit/types/market'
import { constQ, fallbackQ, mapQuery, q } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'
import { useMarketContext } from '../market-context'
import { useAdvancedDetailsData } from './hooks/useAdvancedDetailsData'
import { getMaxLtv } from './market-risk-values'

const { Grid, Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketAdvancedDetails'
const OVERVIEW_METRIC_CATEGORY = 'llamalend.marketOverview'

export const AdvancedDetails = () => {
  const { chainId, marketId, market, marketType, apiMarket } = useMarketContext()
  const { borrowedUsdRate, collateral, availableLiquidity, tvl, maxLeverage, solvency, totalBorrowers } =
    useAdvancedDetailsData({
      chainId,
      market,
      marketId,
      marketType,
      apiMarket,
    })
  const isLendMarket = marketType === MarketType.Lend

  return (
    <Box
      data-testid="market-advanced-details"
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
        value={mapQuery(totalBorrowers, ({ value }) => value)}
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

export const MarketOverviewDetails = () => {
  const { apiMarket, blockchainId, chainId, market, marketId, marketType, tokens } = useMarketContext()
  const data = useAdvancedDetailsData({ chainId, market, marketId, marketType, apiMarket })
  const parameters = useMarketParameters({ chainId, marketId })
  const oraclePrice = fallbackQ(
    q(useMarketOraclePrice({ chainId, marketId })),
    mapQuery(apiMarket, market => decimal(market.oraclePrice)),
  )
  const maxLtv = fallbackQ(
    mapQuery(parameters, ({ A, loan_discount }) => getMaxLtv(A, loan_discount)),
    mapQuery(apiMarket, market => market.maxLtv),
  )
  const deployedDays = mapQuery(apiMarket, ({ createdAt }) =>
    createdAt ? Math.max(0, Math.floor((Date.now() - createdAt) / TIME_FRAMES.DAY_MS)) : undefined,
  )

  return (
    <Stack data-testid="market-advanced-details" sx={{ gap: Spacing.md }}>
      <MarketMetricGrid data-testid="market-overview-summary">
        <Metric
          category={OVERVIEW_METRIC_CATEGORY}
          testId="market-solvency"
          label={t`Solvency`}
          value={data.solvency ? mapQuery(data.solvency, ({ value }) => value) : constQ(undefined)}
          valueOptions={{ unit: 'percentage' }}
          valueTooltip={{
            title: t`Solvency`,
            body: <SolvencyTooltip type={MarketType.Lend} />,
            ...TooltipOptions,
          }}
        />
        <Metric
          category={OVERVIEW_METRIC_CATEGORY}
          testId="market-total-suppliers"
          label={t`Total suppliers`}
          value={constQ(undefined)}
        />
        <Metric
          category={OVERVIEW_METRIC_CATEGORY}
          testId="market-total-borrowers"
          label={t`Total borrowers`}
          value={mapQuery(data.totalBorrowers, ({ value }) => value)}
          valueOptions={{ abbreviate: true }}
        />
        <Metric
          category={OVERVIEW_METRIC_CATEGORY}
          testId="market-deployed-since"
          label={t`Deployed since`}
          value={deployedDays}
          valueOptions={{ abbreviate: false, decimals: 0, unit: { symbol: t`Days`, position: 'suffix' } }}
        />
      </MarketMetricGrid>
      <Box
        data-testid="market-overview-details"
        sx={{
          display: 'grid',
          columnGap: Grid.Column_Spacing,
          rowGap: Spacing.md,
          gridTemplateColumns: { mobile: 'minmax(0, 1fr)', tablet: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Stack>
          <ActionInfo
            testId="market-overview-collateral"
            label={t`Collateral`}
            value={tokens.collateralToken?.symbol ?? t`N/A`}
            valueLeft={
              <TokenIcon
                blockchainId={blockchainId}
                address={tokens.collateralToken?.address}
                tooltip={tokens.collateralToken?.symbol ?? t`Collateral`}
                size="mui-md"
              />
            }
          />
          <ActionInfo
            testId="market-overview-borrowed"
            label={t`Borrowed`}
            value={tokens.borrowToken?.symbol ?? t`N/A`}
            valueLeft={
              <TokenIcon
                blockchainId={blockchainId}
                address={tokens.borrowToken?.address}
                tooltip={tokens.borrowToken?.symbol ?? t`Borrowed`}
                size="mui-md"
              />
            }
          />
          <ActionInfo
            testId="market-overview-max-ltv"
            label={t`Max LTV`}
            labelTooltip={{ title: t`The highest loan-to-value ratio allowed when opening or increasing a position.` }}
            valueTooltip={t`Max possible loan at N=4`}
            value={mapQuery(maxLtv, value => formatNumber(value, 'percent.rate'))}
          />
        </Stack>
        <Stack>
          <ActionInfo
            testId="market-overview-oracle-price"
            label={t`Oracle price`}
            labelTooltip={{
              title: t`The price source that determines your collateral value, health, and when your position moves toward soft liquidation.`,
            }}
            value={mapQuery(oraclePrice, value => formatNumber(value, { abbreviate: false, fallback: '-' }))}
            valueTooltip={formatNumber(oraclePrice.data, { decimals: 5, abbreviate: false, fallback: '-' })}
          />
          <ActionInfo testId="market-overview-price-per-share" label={t`Price per share`} value={t`N/A`} />
          <ActionInfo
            testId="market-overview-max-leverage"
            label={t`Max leverage`}
            labelTooltip={{ title: t`Maximum Leverage`, body: <MaxLeverageTooltip />, ...TooltipOptions }}
            value={mapQuery(data.maxLeverage, ({ value }) => formatNumber(value, 'multiplier'))}
          />
        </Stack>
      </Box>
    </Stack>
  )
}
