import Stack from '@mui/material/Stack'
import { Metric, type MetricProps } from '@ui/components/Metric'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces
/** Renders the standard pool summary metrics from app-supplied query values. */
export const PoolHeaderMetrics = ({
  tvl,
  volume24h,
}: {
  tvl: MetricProps['value']
  volume24h?: MetricProps['value']
}) => (
  <Stack direction="row" sx={{ gap: Spacing.xxl, alignItems: 'center', flexWrap: 'wrap' }}>
    <Metric label={t`TVL`} value={tvl} valueOptions={{ unit: 'dollar' }} category="dex.poolHeader" alignment="end" />
    {volume24h !== undefined && (
      <Metric
        label={t`24h volume`}
        value={volume24h}
        valueOptions={{ unit: 'dollar' }}
        category="dex.poolHeader"
        alignment="end"
      />
    )}
  </Stack>
)
