import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { MarketMetricGrid } from '@/llamalend/widgets/MarketMetricGrid'
import { MaxLeverageTooltip, SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketType } from '@evm-ui/types/market'
import { mapQuery } from '@evm-ui/types/util'
import { formatNumber } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { useMarketContext } from '../market-context'
import { useAdvancedDetailsData } from './hooks/useAdvancedDetailsData'
import { MarketAssets, MarketOverviewSkeleton } from './MarketContractsSection'
import { MarketMaxLtvRow } from './MarketLoanParameters'
import { MarketPricesRows } from './MarketParameterRows'

const { Grid, Spacing } = SizesAndSpaces

const OVERVIEW_METRIC_CATEGORY = 'llamalend.marketOverview'

export const MarketOverviewCard = () => {
  const { apiMarket, chainId, blockchainId, market, marketId, marketQuery, marketType } = useMarketContext()
  const { solvency, totalBorrowers, totalSuppliers, maxLeverage, deployedDays } = useAdvancedDetailsData({
    chainId,
    marketQuery,
    marketId,
    marketType,
    apiMarket,
  })
  return (
    <Card size="small" data-testid="market-overview-card">
      <MarketCardHeader title={t`Overview`} />
      <CardContent component={Stack} data-testid="market-advanced-details" sx={{ gap: Spacing.md }}>
        <MarketMetricGrid data-testid="market-overview-summary">
          {solvency && (
            <Metric
              category={OVERVIEW_METRIC_CATEGORY}
              testId="market-solvency"
              label={t`Solvency`}
              value={mapQuery(solvency, ({ value }) => value)}
              valueOptions={{ unit: 'percentage' }}
              valueTooltip={{ title: t`Solvency`, body: <SolvencyTooltip type={MarketType.Lend} /> }}
            />
          )}
          {marketType === MarketType.Lend && (
            <Metric
              category={OVERVIEW_METRIC_CATEGORY}
              testId="market-total-suppliers"
              label={t`Total suppliers`}
              value={totalSuppliers}
              valueOptions={{ abbreviate: true }}
            />
          )}
          <Metric
            category={OVERVIEW_METRIC_CATEGORY}
            testId="market-total-borrowers"
            label={t`Total borrowers`}
            value={totalBorrowers}
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
          <MarketAssets chainId={chainId} blockchainId={blockchainId} market={market} apiMarket={apiMarket} />
          <MarketOverviewSkeleton chainId={chainId} blockchainId={blockchainId} market={market} apiMarket={apiMarket}>
            <MarketPricesRows
              chainId={chainId}
              marketId={marketId}
              enablePricePerShare={marketType === MarketType.Lend}
              apiMarket={apiMarket}
            />
            <MarketMaxLtvRow chainId={chainId} marketId={marketId} apiMarket={apiMarket} />
            <ActionInfo
              testId="market-overview-max-leverage"
              label={t`Max leverage`}
              labelTooltip={{ title: t`Maximum Leverage`, body: <MaxLeverageTooltip /> }}
              value={mapQuery(maxLeverage, ({ value }) => formatNumber(value, 'multiplier'))}
            />
          </MarketOverviewSkeleton>
        </Box>
      </CardContent>
    </Card>
  )
}
