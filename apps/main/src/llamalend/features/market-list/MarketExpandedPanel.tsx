import { type FunctionComponent, ReactNode, useMemo } from 'react'
import { formatEstimatedNetBorrowRate, formatNetSupplyRate, tokenMetric } from '@/llamalend/llama.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { MarketRateType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils/average-categories'
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Metric } from '@ui/components/Metric'
import { useLayoutStore } from '@ui/features/layout/store'
import { constQ } from '@ui/features/queries/util'
import { type ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsTiny } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { borderStyle } from '@ui/lib/mui'
import { formatCappedRateValue } from '@ui/lib/rates.utils'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'
import { LineGraphCell } from './cells/LineGraphCell'
import { BorrowRateTooltip } from './cells/RateCell/BorrowRateTooltip'
import type { RateTooltipProps } from './cells/RateCell/RateCell'
import { RewardsIcons } from './cells/RateCell/RewardsIcons'
import { SupplyRateLendTooltip } from './cells/RateCell/SupplyRateLendTooltip'
import { MARKET_TITLES } from './columns/column.titles'
import { MarketColumnId } from './columns/columns.enum'

const { Spacing } = SizesAndSpaces

const EXPANDED_DETAILS_METRIC_CATEGORY = 'llamalend.marketListExpandedDetails'
const POSITION_METRIC_CATEGORY = 'llamalend.marketListPosition'

const ratesConfig: Record<
  MarketRateType,
  {
    tooltipComponent: FunctionComponent<RateTooltipProps>
    title: string
    rateKey: keyof LlamaMarket['rates']
    getSubRate: (rates: LlamaMarket['rates']) => string
  }
> = {
  [MarketRateType.Supply]: {
    tooltipComponent: SupplyRateLendTooltip,
    title: MARKET_TITLES[MarketColumnId.SupplyRate],
    rateKey: 'lendApy',
    getSubRate: ({ lendTotalApyMinBoosted }) => formatNetSupplyRate(lendTotalApyMinBoosted),
  },
  [MarketRateType.Borrow]: {
    tooltipComponent: BorrowRateTooltip,
    title: MARKET_TITLES[MarketColumnId.BorrowRate],
    rateKey: 'borrowApr',
    getSubRate: ({ borrowTotalApr }) => formatEstimatedNetBorrowRate(borrowTotalApr),
  },
}

function useMobileGraphSize() {
  const pageWidth = useLayoutStore(state => state.windowWidth)
  const isTiny = useIsTiny()
  return useMemo(() => ({ width: pageWidth ? pageWidth - (isTiny ? 20 : 40) : 300, height: 48 }), [pageWidth, isTiny])
}

const RateItem = ({ market, type }: { market: LlamaMarket; type: MarketRateType }) => {
  const { tooltipComponent: Tooltip, title, rateKey, getSubRate } = ratesConfig[type]
  const rateValue = market.rates[rateKey] as number
  return (
    rateValue != null && (
      <Grid size={6}>
        <Tooltip market={market}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
            <Metric
              category="llamalend.marketListRates"
              label={title}
              value={rateValue}
              valueOptions={{
                unit: 'percentage',
                abbreviate: false,
                formatter: formatCappedRateValue,
                disableTooltip: true,
              }}
              notional={constQ(getSubRate(market.rates))}
              icon={<RewardsIcons market={market} rateType={type} />}
            />
          </Stack>
        </Tooltip>
      </Grid>
    )
  )
}

const GridSection = ({ children }: { children: ReactNode }) => (
  <Grid container spacing={Spacing.md}>
    {children}
  </Grid>
)

const GridHeader = ({ ...props }: Omit<CardHeaderProps, 'sx'>) => (
  <Grid size={12}>
    <CardHeader {...props} sx={{ borderBottom: borderStyle }} />
  </Grid>
)

export const MarketExpandedPanel = ({
  row: { original: market },
}: Parameters<ExpandedPanelComponent<LlamaMarketRow>>[0]) => {
  const { assets, leverage, liquidity, liquidityUsd, lendingPosition, utilizationPercent } = market
  const graphSize = useMobileGraphSize()

  return (
    <>
      <GridSection>
        <RateItem market={market} type={MarketRateType.Borrow} />
        <RateItem market={market} type={MarketRateType.Supply} />
        <Grid size={12} data-testid="llama-market-graph">
          <Stack direction="column" sx={{ alignItems: 'center' }}>
            <Typography variant="bodyXsRegular" color="textTertiary" sx={{ alignSelf: 'start' }}>
              {t`${AVERAGE_CATEGORIES['llamalend.marketList.rate'].period} Rate Chart`}
            </Typography>

            <LineGraphCell market={market} type={MarketRateType.Borrow} graphSize={graphSize} />
          </Stack>
        </Grid>
        <Grid size={12}>
          {leverage && (
            <Metric
              category={EXPANDED_DETAILS_METRIC_CATEGORY}
              label={MARKET_TITLES[MarketColumnId.MaxLeverage]}
              value={leverage}
              valueOptions={{ unit: 'multiplier' }}
            />
          )}
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={MARKET_TITLES[MarketColumnId.UtilizationPercent]}
            value={utilizationPercent}
            valueOptions={{ unit: 'percentage' }}
            testId="metric-utilizationPercent"
          />
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={MARKET_TITLES[MarketColumnId.LiquidityUsd]}
            {...tokenMetric({
              value: liquidity,
              symbol: assets.borrowed.symbol,
              notional: constQ({ value: liquidityUsd, unit: 'dollar' as const }),
            })}
          />
        </Grid>
      </GridSection>
      {/* TODO: implement borrow position metrics after backend endpoint is ready */}
      {/* {userHasPositions?.Borrow && (
        <GridSection>
          <GridHeader title={t`Borrow details`} />
        </GridSection>
      )} */}
      {lendingPosition && (
        <GridSection>
          <GridHeader title={t`Lending details`} />
          <Grid size={12}>
            {lendingPosition && (
              <Metric
                category={POSITION_METRIC_CATEGORY}
                label={MARKET_TITLES[MarketColumnId.UserEarnings]}
                value={lendingPosition.earnings}
                valueOptions={{ unit: 'dollar' }}
              />
            )}
            {lendingPosition && (
              <Metric
                category={POSITION_METRIC_CATEGORY}
                label={MARKET_TITLES[MarketColumnId.UserDeposited]}
                value={lendingPosition.supplied}
                valueOptions={{ unit: { symbol: assets.borrowed.symbol, position: 'suffix' } }}
              />
            )}
          </Grid>
        </GridSection>
      )}
    </>
  )
}
