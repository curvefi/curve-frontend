import { pegStatus, type PegStatus } from '@/loan/components/PagePegKeepers/components/peg-status.util'
import { usePegkeeper } from '@/loan/components/PagePegKeepers/hooks/usePegkeeper'
import type { PegKeeper } from '@/loan/components/PagePegKeepers/types'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatUsd } from '@ui-kit/utils'
import type { PegKeeperTableRow } from '../columns/columns.definitions'

const { Spacing } = SizesAndSpaces

const formatUsdOrFallback = (value: string | undefined) => (value == null ? t`N/A` : formatUsd(Number(value)))

const PegStatusDot = ({ status: { color, label } }: { status: PegStatus }) => (
  <Box
    component="span"
    aria-label={label === 'loading' ? undefined : label}
    sx={{
      width: '0.375rem',
      height: '0.375rem',
      borderRadius: '50%',
      flexShrink: 0,
      marginBlockStart: '0.45rem',
      visibility: label === 'loading' ? 'hidden' : 'visible',
      backgroundColor: theme =>
        color === 'active'
          ? theme.design.Layer.Feedback.Success
          : color === 'warning'
            ? theme.design.Layer.Feedback.Warning
            : theme.design.Layer.Feedback.Error,
    }}
  />
)

export const PegKeeperCell = ({ getValue }: CellContext<PegKeeperTableRow, PegKeeper>) => {
  const pegkeeper = getValue()
  const { rate, debt, debtCeiling } = usePegkeeper(pegkeeper)
  const status = pegStatus(rate)

  return (
    <Stack direction="row" justifyContent="space-between" gap={Spacing.md}>
      <Stack direction="row" gap={Spacing.xs}>
        <PegStatusDot status={status} />
        <Stack>
          <Typography variant="bodySBold">{pegkeeper.token}</Typography>
          <Typography variant="bodyXsRegular" color="textTertiary">
            {pegkeeper.pool.name}
          </Typography>
        </Stack>
      </Stack>
      <WithSkeleton loading={debt == null && debtCeiling == null}>
        <Typography variant="bodySBold" textAlign="right">
          {formatUsdOrFallback(debt)} / {formatUsdOrFallback(debtCeiling)}
        </Typography>
      </WithSkeleton>
    </Stack>
  )
}
