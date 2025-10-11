import type { CellContext } from '@tanstack/react-table'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { isSortedBy } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import type { PoolListItem } from '../types'

export const PoolVolumeCell = ({ column, getValue, table }: CellContext<PoolListItem, number | undefined>) => (
  <Chip
    isBold={isSortedBy(table, column)}
    size="md"
    tooltip={formatNumber(getValue(), FORMAT_OPTIONS.USD)}
    tooltipProps={{ placement: 'bottom-end' }}
  >
    {formatNumber(getValue(), { currency: 'USD', notation: 'compact' })}
  </Chip>
)
