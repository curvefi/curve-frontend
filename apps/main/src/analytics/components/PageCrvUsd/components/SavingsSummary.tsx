import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const SavingsSummary = ({
  apy,
  supply,
  avgBorrowApy,
  marketCount,
  loading,
}: {
  apy: number | undefined
  supply: number | undefined
  avgBorrowApy: number | undefined
  marketCount: number | undefined
  loading: boolean
}) => (
  <Card size="small" sx={{ height: '100%' }}>
    <CardHeader title={t`scrvUSD Savings`} />
    <CardContent sx={{ padding: Spacing.md }}>
      <Grid container columns={2} spacing={Spacing.md}>
        <Grid size={1}>
          <Metric label={t`APY`} value={apy} loading={loading} valueOptions={{ unit: 'percentage' }} size="large" />
        </Grid>
        <Grid size={1}>
          <Metric label={t`TVL`} value={supply} loading={loading} valueOptions={{ unit: 'dollar' }} size="small" />
        </Grid>
        <Grid size={1}>
          <Metric
            label={t`Avg Borrow APY`}
            value={avgBorrowApy}
            loading={loading}
            valueOptions={{ unit: 'percentage' }}
            size="small"
          />
        </Grid>
        <Grid size={1}>
          <Metric
            label={t`Markets`}
            value={marketCount}
            loading={loading}
            valueOptions={{ unit: 'none', abbreviate: false, decimals: 0 }}
            size="small"
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)
