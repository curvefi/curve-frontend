import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Badge } from '@ui/components/Badge'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

/** Gauge label with an `Active` or `Inactive` badge, or an error icon when the killed status can't be loaded. */
export const GaugeStatusLabel = ({
  label,
  isKilled: { data: isKilled, isLoading, error },
  testId,
}: {
  label: string
  isKilled: QueryProp<boolean | null>
  testId: string
}) => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <Typography variant="bodyMRegular" color="textSecondary">
      {label}
    </Typography>
    {error ? (
      <ErrorIconButton error={error} size="extraSmall" />
    ) : (
      <WithSkeleton loading={isLoading}>
        <Badge
          size="extraSmall"
          color={isKilled ? 'warning' : 'active'}
          label={isKilled ? t`Inactive` : t`Active`}
          data-testid={testId}
        />
      </WithSkeleton>
    )}
  </Stack>
)
