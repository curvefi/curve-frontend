import { useMemo } from 'react'
import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
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
import type { LlamaMarket } from '../entities/llama-markets'
import { LineGraphCell } from './cells'
import { BorrowRateTooltip } from './cells/RateCell/BorrowRateTooltip'
import { LendRateTooltip } from './cells/RateCell/LendRateTooltip'
import { RewardsIcons } from './cells/RateCell/RewardsIcons'
import { FavoriteMarketButton } from './chips/FavoriteMarketButton'
import { LlamaMarketColumnId } from './columns.enum'

const { Spacing } = SizesAndSpaces

const TooltipComponents = {
  [MarketRateType.Supply]: LendRateTooltip,
  [MarketRateType.Borrow]: BorrowRateTooltip,
} as const

const RateMapping = {
  [MarketRateType.Supply]: 'lend',
  [MarketRateType.Borrow]: 'borrow',
} as const

function useMobileGraphSize() {
  const pageWidth = useLayoutStore((state) => state.windowWidth)
  const isTiny = useIsTiny()
  return useMemo(() => ({ width: pageWidth ? pageWidth - (isTiny ? 20 : 40) : 300, height: 48 }), [pageWidth, isTiny])
}

const RateItem = ({ market, title, type }: { market: LlamaMarket; title: string; type: MarketRateType }) => {
  const Tooltip = TooltipComponents[type]
  const rate = market.rates[RateMapping[type]]
  return (
    rate != null && (
      <Grid size={6}>
        <Tooltip market={market}>
          <Stack direction="row" alignItems="center" gap={2}>
            {/* todo: omit metric component tooltip */}
            <Metric label={title} value={rate} valueOptions={{ unit: 'percentage' }} />
            <RewardsIcons market={market} rateType={MarketRateType.Borrow} />
          </Stack>
        </Tooltip>
      </Grid>
    )
  )
}

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  const { data: earnings, error: earningsError } = useUserMarketStats(market, LlamaMarketColumnId.UserEarnings)
  const { data: deposited, error: depositedError } = useUserMarketStats(market, LlamaMarketColumnId.UserDeposited)
  const { address, assets, leverage, liquidityUsd, type, url, userPositions, utilizationPercent } = market
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
                    copyText={address}
                    confirmationText={t`Market address copied`}
                    data-testid={`copy-market-address-${address}`}
                  />
                  <FavoriteMarketButton address={address} />
                </Stack>
              </Stack>
            }
            sx={{ paddingInline: 0 }}
          ></CardHeader>
        </Grid>
        <RateItem market={market} type={MarketRateType.Borrow} title={t`Borrow rate`} />
        <RateItem market={market} type={MarketRateType.Supply} title={t`Supply yield`} />
        {leverage > 0 && (
          <Grid size={6}>
            <Metric label={t`Leverage 🔥`} value={leverage} valueOptions={{ unit: 'multiplier' }} />
          </Grid>
        )}
        <Grid size={6}>
          <Metric
            label={t`Utilization`}
            value={utilizationPercent}
            valueOptions={{ unit: 'percentage', decimals: 2 }}
            testId="metric-utilizationPercent"
          />
        </Grid>
        <Grid size={6}>
          <Metric label={t`Available Liquidity`} value={liquidityUsd} valueOptions={{ unit: 'dollar' }} />
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
      {userPositions && (
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
