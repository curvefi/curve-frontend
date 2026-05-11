import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export type LlamaLendSummaryData = {
  activeMarkets: number
  totalSupplied: number
  totalBorrowed: number
  utilization: number
  avgBorrowApy: number
  avgLendApy: number
}

export const LlamaLendSummary = ({ summary, loading }: { summary: LlamaLendSummaryData; loading: boolean }) => (
  <Card size="small" sx={{ height: '100%' }}>
    <CardHeader title={t`LlamaLend`} />
    <CardContent>
      <Grid container columns={{ mobile: 2, tablet: 3 }} spacing={Spacing.md}>
        <Grid size={1}>
          <Metric
            label={t`Avg Lend APY`}
            value={summary.avgLendApy}
            loading={loading}
            valueOptions={{ unit: 'percentage' }}
          />
        </Grid>
        <Grid size={1}>
          <Metric
            label={t`Total Supplied`}
            value={summary.totalSupplied}
            loading={loading}
            valueOptions={{ unit: 'dollar' }}
          />
        </Grid>
        <Grid size={1}>
          <Metric
            label={t`Total Borrowed`}
            value={summary.totalBorrowed}
            loading={loading}
            valueOptions={{ unit: 'dollar' }}
          />
        </Grid>
        <Grid size={1}>
          <Metric
            label={t`Utilization`}
            value={summary.utilization}
            loading={loading}
            valueOptions={{ unit: 'percentage' }}
          />
        </Grid>
        <Grid size={1}>
          <Metric
            label={t`Avg Borrow APY`}
            value={summary.avgBorrowApy}
            loading={loading}
            valueOptions={{ unit: 'percentage' }}
          />
        </Grid>
        <Grid size={1}>
          <Metric
            label={t`Active Markets`}
            value={summary.activeMarkets}
            loading={loading}
            valueOptions={{ unit: 'none', abbreviate: false, decimals: 0 }}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)
