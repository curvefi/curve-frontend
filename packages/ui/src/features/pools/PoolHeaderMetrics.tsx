import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { Amount } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { formatCappedRateValue } from '@ui/lib/rates.utils'

const { Spacing } = SizesAndSpaces
/** Renders the standard pool summary metrics from app-supplied query values. */
export const PoolHeaderMetrics = ({
  tvl,
  volume24h,
  netApr,
  netAprTooltip,
}: {
  tvl: QueryProp<Amount>
  volume24h?: QueryProp<Amount>
  netApr?: QueryProp<Amount>
  netAprTooltip?: ReactNode
}) => (
  <Stack direction="row" sx={{ gap: Spacing.xxl, alignItems: 'center', flexWrap: 'wrap' }}>
    {maybe(netApr, netApr => (
      <Metric
        label={t`Net APR`}
        value={netApr}
        valueOptions={{ unit: 'percentage', formatter: formatCappedRateValue }}
        valueTooltip={maybe(netAprTooltip, body => ({ title: t`Net APR`, body, clickable: true }))}
        category="dex.poolHeader"
        alignment="end"
      />
    ))}
    <Metric label={t`TVL`} value={tvl} valueOptions={{ unit: 'dollar' }} category="dex.poolHeader" alignment="end" />
    {maybe(volume24h, volume24h => (
      <Metric
        label={t`24h volume`}
        value={volume24h}
        valueOptions={{ unit: 'dollar' }}
        category="dex.poolHeader"
        alignment="end"
      />
    ))}
  </Stack>
)
