import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { MarketMetricGrid } from '@/llamalend/widgets/MarketMetricGrid'
import { MaxLeverageTooltip, SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketType } from '@ui-kit/types/market'
import { mapQuery } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { useMarketContext } from '../market-context'
import { useAdvancedDetailsData } from './hooks/useAdvancedDetailsData'
import { MarketMaxLtvRow } from './MarketLoanParameters'
import { MarketPricesRows } from './MarketParameterRows'

const { Grid, Spacing } = SizesAndSpaces

const OVERVIEW_METRIC_CATEGORY = 'llamalend.marketOverview'

export const MarketOverviewCard = () => {
  const { apiMarket, blockchainId, chainId, market, marketId, marketType, tokens } = useMarketContext()
  const { solvency, totalBorrowers, maxLeverage } = useAdvancedDetailsData({
    chainId,
    market,
    marketId,
    marketType,
    apiMarket,
  })
  const deployedDays = mapQuery(apiMarket, ({ createdAt }) =>
    createdAt ? Math.max(0, Math.floor((Date.now() - createdAt) / TIME_FRAMES.DAY_MS)) : undefined,
  )

  return (
    <Card size="small" data-testid="market-overview-card">
      <MarketCardHeader title={t`Overview`} />
      <CardContent component={Stack}>
        <Stack sx={{ gap: Spacing.md }}>
          <MarketMetricGrid data-testid="market-overview-summary">
            {solvency && (
              <Metric
                category={OVERVIEW_METRIC_CATEGORY}
                testId="market-solvency"
                label={t`Solvency`}
                value={mapQuery(solvency, ({ value }) => value)}
                valueOptions={{ unit: 'percentage' }}
                valueTooltip={{
                  title: t`Solvency`,
                  body: <SolvencyTooltip type={MarketType.Lend} />,
                }}
              />
            )}
            {/*
            TODO: get total suppliers
             <Metric
              category={OVERVIEW_METRIC_CATEGORY}
              testId="market-total-suppliers"
              label={t`Total suppliers`}
              value={}
            /> */}
            <Metric
              category={OVERVIEW_METRIC_CATEGORY}
              testId="market-total-borrowers"
              label={t`Total borrowers`}
              value={mapQuery(totalBorrowers, ({ value }) => value)}
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
                value={tokens.collateralToken?.symbol}
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
                value={tokens.borrowToken?.symbol}
                valueLeft={
                  <TokenIcon
                    blockchainId={blockchainId}
                    address={tokens.borrowToken?.address}
                    tooltip={tokens.borrowToken?.symbol ?? t`Borrowed`}
                    size="mui-md"
                  />
                }
              />
              <MarketMaxLtvRow chainId={chainId} marketId={marketId} apiMarket={apiMarket} />
            </Stack>
            <Stack>
              <MarketPricesRows
                chainId={chainId}
                marketId={marketId}
                enablePricePerShare={marketType === MarketType.Lend}
                apiMarket={apiMarket}
              />
              <ActionInfo
                testId="market-overview-max-leverage"
                label={t`Max leverage`}
                labelTooltip={{ title: t`Maximum Leverage`, body: <MaxLeverageTooltip /> }}
                value={mapQuery(maxLeverage, ({ value }) => formatNumber(value, 'multiplier'))}
              />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
