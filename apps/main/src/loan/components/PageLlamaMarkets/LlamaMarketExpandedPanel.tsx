import Link from 'next/link'
import { useMemo } from 'react'
import { LineGraphCell } from '@/loan/components/PageLlamaMarkets/cells'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { FavoriteMarketButton } from '@/loan/components/PageLlamaMarkets/FavoriteMarketButton'
import { useUserMarketStats } from '@/loan/entities/llama-market-stats'
import useStore from '@/loan/store/useStore'
import { ArrowRight } from '@carbon/icons-react'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { type ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarket } from '../../entities/llama-markets'

const { Spacing } = SizesAndSpaces

const GraphMobileCell = ({ market }: { market: LlamaMarket }) => {
  const pageWidth = useStore((state) => state.layout.windowWidth)
  const graphSize = useMemo(() => ({ width: pageWidth ? pageWidth - 40 : 300, height: 48 }), [pageWidth])
  return (
    <Stack direction="column">
      <Typography variant="bodyXsRegular" color="textTertiary">
        {t`7D Rate Chart`}
      </Typography>

      <LineGraphCell market={market} type="borrow" graphSize={graphSize} />
    </Stack>
  )
}

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({ row: { original: market } }) => {
  const { data: earnings, error: earningsError } = useUserMarketStats(market, LlamaMarketColumnId.UserEarnings)
  const { data: deposited, error: depositedError } = useUserMarketStats(market, LlamaMarketColumnId.UserDeposited)
  const { leverage, utilizationPercent, liquidityUsd, userHasPosition, url, address, rates } = market
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
          <Metric label={t`7D Avg Borrow Rate`} value={rates.borrow} unit="percentage" />
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
        <Grid size={12}>
          <GraphMobileCell market={market} />
        </Grid>
      </Grid>
      {userHasPosition && (
        <Grid container spacing={Spacing.md}>
          <Grid size={12}>
            <CardHeader title={t`Your Position`} sx={{ paddingInline: 0 }}></CardHeader>
          </Grid>
          {earnings?.earnings != null && (
            <Grid size={6}>
              <Metric label={t`Earnings`} value={earnings.earnings} unit="dollar" />
            </Grid>
          )}
          {deposited?.deposited != null && (
            <Grid size={6}>
              <Metric label={t`Supplied Amount`} value={deposited.deposited} unit="dollar" />
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
