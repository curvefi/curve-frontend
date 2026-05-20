import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { formatNumber, formatUsd } from '@ui-kit/utils'
import type { SupplySummaryRow } from '../columns/columns.definitions'

export const SupplyValueDisplay = ({
  value,
  total,
  percentage,
  showSign,
}: {
  value: number | undefined
  total?: number
  percentage?: number
  showSign?: boolean
}) => (
  <Typography variant="bodySBold" textAlign="right">
    {value == null ? t`N/A` : `${showSign && value > 0 ? '+' : ''}${formatUsd(value)}`}
    {value != null && (percentage != null || total) ? (
      <Typography component="span" variant="bodyXsRegular" color="textTertiary">
        {' '}
        (
        {formatNumber(percentage ?? (100 * value) / total!, {
          unit: 'percentage',
          abbreviate: false,
        })}
        )
      </Typography>
    ) : null}
  </Typography>
)

export const ValueCell = ({ row, getValue }: CellContext<SupplySummaryRow, number | undefined>) => (
  <WithSkeleton loading={row.original.loading}>
    <SupplyValueDisplay
      value={getValue()}
      total={row.original.total}
      percentage={row.original.percentage}
      showSign={row.original.showSign}
    />
  </WithSkeleton>
)
