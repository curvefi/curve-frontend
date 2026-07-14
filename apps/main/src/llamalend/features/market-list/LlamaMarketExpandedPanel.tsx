import { type FunctionComponent, useMemo } from 'react'
import { NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { tokenMetric } from '@/llamalend/llama.utils'
import { ArrowRight } from '@carbon/icons-react'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { constQ } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES, borderStyle } from '@ui-kit/utils'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'
import { LineGraphCell, RateTooltipProps } from './cells'
import { BorrowRateTooltip } from './cells/RateCell/BorrowRateTooltip'
import { RewardsIcons } from './cells/RateCell/RewardsIcons'
import { SupplyRateLendTooltip } from './cells/RateCell/SupplyRateLendTooltip'
import { FavoriteMarketButton } from './chips/FavoriteMarketButton'

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
            {/* todo: omit metric component tooltip */}
            <Metric
              category="llamalend.marketListRates"
              label={title}
              value={rateValue}
              valueOptions={{ unit: 'percentage' }}
              icon={<RewardsIcons market={market} rateType={type} />}
            />
          </Stack>
        </Tooltip>
      </Grid>
    )
  )
}

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  const {
    controllerAddress,
    favoriteKey,
    assets,
    leverage,
    liquidity,
    liquidityUsd,
    url,
    userHasPositions,
    lendingPosition,
    utilizationPercent,
    tvl,
    totalCollateralUsd,
    totalDebtUsd,
  } = market
  const graphSize = useMobileGraphSize()

  return (
    <>
      <Grid container spacing={Spacing.md}>
        <Grid size={12}>
          <CardHeader
            title={t`Market Details`}
            action={
              <Stack direction="row" sx={{ gap: Spacing.sm }}>
                <CopyIconButton
                  label={t`Copy market address`}
                  copyText={controllerAddress}
                  confirmationText={t`Market address copied`}
                  data-testid={`copy-market-address-${controllerAddress}`}
                />
                <FavoriteMarketButton address={favoriteKey} />
              </Stack>
            }
          />
        </Grid>
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
        {leverage && (
          <Grid size={12}>
            <Metric
              category={EXPANDED_DETAILS_METRIC_CATEGORY}
              label={t`Leverage 🔥`}
              value={leverage}
              valueOptions={{ unit: 'multiplier' }}
            />
          </Grid>
        )}
        <Grid size={12}>
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={t`Utilization`}
            value={utilizationPercent}
            valueOptions={{ unit: 'percentage' }}
            testId="metric-utilizationPercent"
          />
        </Grid>
        <Grid size={12}>
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
        <Grid size={12}>
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={t`Total Debt`}
            value={totalDebtUsd}
            valueOptions={{ unit: 'dollar' }}
          />
        </Grid>
        <Grid size={12}>
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={t`Total Collateral`}
            value={totalCollateralUsd}
            valueOptions={{ unit: 'dollar' }}
          />
        </Grid>
        <Grid size={12}>
          <Metric
            category={EXPANDED_DETAILS_METRIC_CATEGORY}
            label={t`TVL`}
            value={tvl}
            valueOptions={{ unit: 'dollar' }}
          />
        </Grid>
      </Grid>
      {userHasPositions && (
        <Grid container spacing={Spacing.md}>
          <Grid size={12}>
            <CardHeader title={t`Your Position`} sx={{ paddingInline: 0 }}></CardHeader>
          </Grid>
          {lendingPosition && (
            <Grid size={6}>
              <Metric
                category={POSITION_METRIC_CATEGORY}
                label={t`Earnings`}
                value={lendingPosition.earnings}
                valueOptions={{ unit: 'dollar' }}
              />
            </Grid>
          )}
          {lendingPosition && (
            <Grid size={6}>
              <Metric
                category={POSITION_METRIC_CATEGORY}
                label={t`Supplied Amount`}
                value={lendingPosition.supplied}
                valueOptions={{ unit: { symbol: assets.borrowed.symbol, position: 'suffix' } }}
              />
            </Grid>
          )}
        </Grid>
      )}
      <Button
        sx={{ flexGrow: 1, borderBlock: borderStyle }}
        component={Link}
        href={url}
        color="ghost"
        data-testid="llama-market-go-to-market"
        endIcon={<ArrowRight />}
      >
        {t`Go To Market`}
      </Button>
    </>
  )
}
