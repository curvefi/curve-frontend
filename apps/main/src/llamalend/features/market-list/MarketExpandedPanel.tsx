import { type FunctionComponent, ReactNode, useMemo } from 'react'
import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { tokenMetric } from '@/llamalend/llama.utils'
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { type ExpandedPanelComponent } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { constQ } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, borderStyle } from '@ui-kit/utils'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'
import { LineGraphCell, RateTooltipProps } from './cells'
import { BorrowRateTooltip } from './cells/RateCell/BorrowRateTooltip'
import { RewardsIcons } from './cells/RateCell/RewardsIcons'
import { SupplyRateLendTooltip } from './cells/RateCell/SupplyRateLendTooltip'

const { Spacing } = SizesAndSpaces

const EXPANDED_DETAILS_METRIC_CATEGORY = 'llamalend.marketListExpandedDetails'
const POSITION_METRIC_CATEGORY = 'llamalend.marketListPosition'

const ratesConfig: Record<
  MarketRateType,
  {
    tooltipComponent: FunctionComponent<RateTooltipProps>
    title: string
    rateKey: keyof LlamaMarket['rates']
  }
> = {
  [MarketRateType.Supply]: {
    tooltipComponent: SupplyRateLendTooltip,
    title: NET_SUPPLY_RATE_TITLE,
    rateKey: 'lendTotalApyMinBoosted',
  },
  [MarketRateType.Borrow]: {
    tooltipComponent: BorrowRateTooltip,
    title: t`Borrow APR`,
    rateKey: 'borrowApr',
  },
}

function useMobileGraphSize() {
  const pageWidth = useLayoutStore(state => state.windowWidth)
  const isTiny = useIsTiny()
  return useMemo(() => ({ width: pageWidth ? pageWidth - (isTiny ? 20 : 40) : 300, height: 48 }), [pageWidth, isTiny])
}

const RateItem = ({ market, type }: { market: LlamaMarket; type: MarketRateType }) => {
  const { tooltipComponent: Tooltip, title, rateKey } = ratesConfig[type]
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
              valueOptions={{ unit: 'percentage', disableTooltip: true }}
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
    <CardHeader {...props} size="small" sx={{ borderBottom: borderStyle }} />
  </Grid>
)

export const MarketExpandedPanel = ({
  row: { original: market },
}: Parameters<ExpandedPanelComponent<LlamaMarket>>[0]) => {
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
              label={t`Leverage`}
              value={leverage}
              valueOptions={{ unit: 'multiplier' }}
            />
          )}
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={t`Utilization`}
            value={utilizationPercent}
            valueOptions={{ unit: 'percentage' }}
            testId="metric-utilizationPercent"
          />
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={t`Available Liquidity`}
            {...tokenMetric({
              value: liquidity,
              symbol: assets.borrowed.symbol,
              notional: constQ(liquidityUsd),
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
                label={t`Earnings`}
                value={lendingPosition.earnings}
                valueOptions={{ unit: 'dollar' }}
              />
            )}
            {lendingPosition && (
              <Metric
                category={POSITION_METRIC_CATEGORY}
                label={t`Supplied Amount`}
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
