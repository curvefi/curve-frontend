import { useMemo } from 'react'
import { useUserMarketStats } from '@/llamalend/entities/llama-market-stats'
import { LineGraphCell } from '@/llamalend/PageLlamaMarkets/cells'
import { BorrowRateTooltip } from '@/llamalend/PageLlamaMarkets/cells/RateCell/BorrowRateTooltip'
import { LendRateTooltip } from '@/llamalend/PageLlamaMarkets/cells/RateCell/LendRateTooltip'
import { LlamaMarketColumnId } from '@/llamalend/PageLlamaMarkets/columns.enum'
import { FavoriteMarketButton } from '@/llamalend/PageLlamaMarkets/FavoriteMarketButton'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
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
import { Metric, type UnitOptions } from '@ui-kit/shared/ui/Metric'
import { RouterLink as Link } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarket } from '../entities/llama-markets'
import { LlamaMarketType } from '../entities/llama-markets'
import { RewardsIcons } from './cells/RateCell/RewardsIcons'

const { Spacing } = SizesAndSpaces

const TooltipComponents = {
  lend: LendRateTooltip,
  borrow: BorrowRateTooltip,
} as const

function useMobileGraphSize() {
  const pageWidth = useLayoutStore((state) => state.windowWidth)
  const isTiny = useIsTiny()
  return useMemo(() => ({ width: pageWidth ? pageWidth - (isTiny ? 20 : 40) : 300, height: 48 }), [pageWidth, isTiny])
}

const RateItem = ({ market, title, type }: { market: LlamaMarket; title: string; type: RateType }) => {
  const Tooltip = TooltipComponents[type]
  return (
    market.rates[type] != null && (
      <Grid size={6}>
        <Tooltip market={market}>
          <Stack direction="row" alignItems="center" gap={2}>
            {/* todo: omit metric component tooltip */}
            <Metric label={title} value={market.rates[type]} valueOptions={{ unit: 'percentage' }} />
            <RewardsIcons market={market} rateType="borrow" />
          </Stack>
        </Tooltip>
      </Grid>
    )
  )
}

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  const { data: earnings, error: earningsError } = useUserMarketStats(market, LlamaMarketColumnId.UserEarnings)
  const { data: deposited, error: depositedError } = useUserMarketStats(market, LlamaMarketColumnId.UserDeposited)
  const { address, assets, leverage, liquidityUsd, type, url, userHasPosition, utilizationPercent } = market
  const borrowedUnit: UnitOptions = { symbol: assets.borrowed.symbol, position: 'suffix' }
  const graphSize = useMobileGraphSize()
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
        <RateItem market={market} type="borrow" title={t`Borrow rate`} />
        <RateItem market={market} type="lend" title={t`Supply yield`} />
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

            <LineGraphCell market={market} type="borrow" graphSize={graphSize} />
          </Stack>
        </Grid>
      </Grid>
      {userHasPosition && (
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
                valueOptions={{ unit: type === LlamaMarketType.Lend ? borrowedUnit : 'dollar' }}
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
