import { useMemo } from 'react'
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
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { useUserMarketStats } from '../../queries/market-list/llama-market-stats'
import type { LlamaMarket } from '../../queries/market-list/llama-markets'
import { LineGraphCell, RateTooltipProps } from './cells'
import { BorrowRateTooltip } from './cells/RateCell/BorrowRateTooltip'
import { RewardsIcons } from './cells/RateCell/RewardsIcons'
import { SupplyRateLendTooltip } from './cells/RateCell/SupplyRateLendTooltip'
import { FavoriteMarketButton } from './chips/FavoriteMarketButton'
import { LlamaMarketColumnId } from './columns'

const { Spacing } = SizesAndSpaces

const ratesConfig: Record<
  MarketRateType,
  {
    tooltipComponent: React.FC<RateTooltipProps>
    title: string
    rateKey: keyof LlamaMarket['rates']
  }
> = {
  [MarketRateType.Supply]: {
    tooltipComponent: SupplyRateLendTooltip,
    title: t`Supply yield`,
    rateKey: 'lendTotalApyMinBoosted',
  },
  [MarketRateType.Borrow]: {
    tooltipComponent: BorrowRateTooltip,
    title: t`Borrow APR`,
    rateKey: 'borrowApr',
  },
}

function useMobileGraphSize() {
  const pageWidth = useLayoutStore((state) => state.windowWidth)
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
          <Stack direction="row" alignItems="center" gap={2}>
            {/* todo: omit metric component tooltip */}
            <Metric label={title} value={rateValue} valueOptions={{ unit: 'percentage' }} />
            <RewardsIcons market={market} rateType={type} />
          </Stack>
        </Tooltip>
      </Grid>
    )
  )
}

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  // todo: update metric component(?) to show the errors when appropriate
  const { data: earnings } = useUserMarketStats(market, LlamaMarketColumnId.UserEarnings)
  const { data: deposited } = useUserMarketStats(market, LlamaMarketColumnId.UserDeposited)
  const {
    controllerAddress,
    favoriteKey,
    assets,
    leverage,
    liquidityUsd,
    type,
    url,
    userHasPositions,
    utilizationPercent,
    tvl,
    totalCollateralUsd,
    totalDebtUsd,
  } = market
  const graphSize = useMobileGraphSize()

  const UnitMapping = {
    [LlamaMarketType.Lend]: { symbol: assets.borrowed.symbol, position: 'suffix' },
    [LlamaMarketType.Mint]: 'dollar',
  } as const

  return (
    <>
      <Grid container spacing={Spacing.md}>
        <Grid size={12}>
          <CardHeader
            title={
              <Stack direction="row" gap={2} justifyContent="space-between">
                {t`Market Details`}
                <Stack direction="row">
                  <CopyIconButton
                    label={t`Copy market address`}
                    copyText={controllerAddress}
                    confirmationText={t`Market address copied`}
                    data-testid={`copy-market-address-${controllerAddress}`}
                  />
                  <FavoriteMarketButton address={favoriteKey} />
                </Stack>
              </Stack>
            }
            sx={{ paddingInline: 0 }}
          ></CardHeader>
        </Grid>
        <RateItem market={market} type={MarketRateType.Borrow} />
        <RateItem market={market} type={MarketRateType.Supply} />
        {leverage && (
          <Grid size={6}>
            <Metric label={t`Leverage 🔥`} value={leverage} valueOptions={{ unit: 'multiplier' }} />
          </Grid>
        )}
        <Grid size={6}>
          <Metric
            label={t`Utilization`}
            value={utilizationPercent}
            valueOptions={{ unit: 'percentage' }}
            testId="metric-utilizationPercent"
          />
        </Grid>
        <Grid size={6}>
          <Metric label={t`Available Liquidity`} value={liquidityUsd} valueOptions={{ unit: 'dollar' }} />
        </Grid>
        <Grid size={6}>
          <Metric label={t`Total Debt`} value={totalDebtUsd} valueOptions={{ unit: 'dollar' }} />
        </Grid>
        <Grid size={6}>
          <Metric label={t`Total Collateral`} value={totalCollateralUsd} valueOptions={{ unit: 'dollar' }} />
        </Grid>
        <Grid size={6}>
          <Metric label={t`TVL`} value={tvl} valueOptions={{ unit: 'dollar' }} />
        </Grid>
        <Grid size={12} data-testid="llama-market-graph">
          <Stack direction="column" alignItems="center">
            <Typography variant="bodyXsRegular" color="textTertiary" alignSelf="start">
              {t`7D Rate Chart`}
            </Typography>

            <LineGraphCell market={market} type={MarketRateType.Borrow} graphSize={graphSize} />
          </Stack>
        </Grid>
      </Grid>
      {userHasPositions && (
        <Grid container spacing={Spacing.md}>
          <Grid size={12}>
            <CardHeader title={t`Your Position`} sx={{ paddingInline: 0 }}></CardHeader>
          </Grid>
          {earnings?.earnings != null && (
            <Grid size={6}>
              <Metric label={t`Earnings`} value={earnings.earnings.earnings} valueOptions={{ unit: 'dollar' }} />
            </Grid>
          )}
          {deposited?.earnings != null && (
            <Grid size={6}>
              <Metric
                label={t`Supplied Amount`}
                value={deposited.earnings.totalCurrentAssets}
                valueOptions={{ unit: UnitMapping[type] }}
              />
            </Grid>
          )}
        </Grid>
      )}
      <Button
        sx={{ flexGrow: 1, borderBlock: (t) => `1px solid ${t.design.Layer[1].Outline}` }}
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
