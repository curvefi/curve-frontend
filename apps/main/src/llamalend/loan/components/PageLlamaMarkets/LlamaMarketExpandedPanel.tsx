import Link from 'next/link'
import { useMemo } from 'react'
import { LineGraphCell } from '@/loan/components/PageLlamaMarkets/cells'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { FavoriteMarketButton } from '@/loan/components/PageLlamaMarkets/FavoriteMarketButton'
import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
import { ArrowRight } from '@carbon/icons-react'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric, type UnitOptions } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarket } from '../../entities/llama-markets'
import { LlamaMarketType } from '../../entities/llama-markets'

const { Spacing } = SizesAndSpaces

function useMobileGraphSize() {
  const pageWidth = useLayoutStore((state) => state.windowWidth)
  const isTiny = useIsTiny()
  return useMemo(() => ({ width: pageWidth ? pageWidth - (isTiny ? 20 : 40) : 300, height: 48 }), [pageWidth, isTiny])
}

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  const { data: earnings, error: earningsError } = useUserMarketStats(market, LlamaMarketColumnId.UserEarnings)
  const { data: deposited, error: depositedError } = useUserMarketStats(market, LlamaMarketColumnId.UserDeposited)
  const { address, assets, leverage, liquidityUsd, rates, type, url, userHasPosition, utilizationPercent } = market
  const borrowedUnit: UnitOptions = { symbol: assets.borrowed.symbol, position: 'suffix', abbreviate: true }
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
        <Grid size={6}>
          <Metric label={t`Borrow Rate`} value={rates.borrow} unit="percentage" />
        </Grid>
        {leverage > 0 && (
          <Grid size={6}>
            <Metric label={t`Leverage 🔥`} value={leverage} unit="multiplier" />
          </Grid>
        )}
        <Grid size={6}>
          <Metric
            label={t`Utilization`}
            value={utilizationPercent}
            unit="percentage"
            testId="metric-utilizationPercent"
            decimals={2}
          />
        </Grid>
        <Grid size={6}>
          <Metric label={t`Available Liquidity`} value={liquidityUsd} unit="dollar" />
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
              <Metric label={t`Earnings`} value={earnings.earnings.earnings} unit="dollar" />
            </Grid>
          )}
          {deposited?.earnings != null && (
            <Grid size={6}>
              <Metric
                label={t`Supplied Amount`}
                value={deposited.earnings.deposited}
                unit={type === LlamaMarketType.Lend ? borrowedUnit : 'dollar'}
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
