import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Badge, type BadgeProps } from '@ui/components/Badge'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { GaugeStatus } from '@ui/lib/gauge-status'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

const GAUGE_STATUS_BADGE = {
  active: { color: 'active', label: t`Active` },
  inactive: { color: 'warning', label: t`Inactive` },
} as const satisfies Record<GaugeStatus, Pick<BadgeProps, 'color' | 'label'>>

/** Gauge label with an `Active` or `Inactive` badge, no badge for gauges the DAO never approved, or an error icon. */
export const GaugeStatusLabel = ({
  label,
  status,
  testId,
}: {
  label: string
  status: QueryProp<GaugeStatus | null>
  testId: string
}) => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <Typography variant="bodyMRegular" color="textSecondary">
      {label}
    </Typography>
    {status.error ? (
      <ErrorIconButton error={status.error} size="extraSmall" />
    ) : (
      <WithSkeleton query={status}>
        <Badge
          size="extraSmall"
          {...(status.data ? GAUGE_STATUS_BADGE[status.data] : { label: t`Loading` })}
          data-testid={testId}
        />
      </WithSkeleton>
    )}
  </Stack>
)
