import { Column } from '@/dao/components/PaginatedTable'
import { GaugeFormattedData } from '@/dao/types/dao.types'

export const GAUGE_VOTES_TABLE_LABELS: Column<GaugeFormattedData>[] = [
  { key: 'title', label: 'Gauge', disabled: true },
  { key: 'weightRelative', label: 'Weight' },
  { key: 'weightRelativeDelta7d', label: '7d Delta' },
  { key: 'weightRelativeDelta60d', label: '60d Delta' },
]

export const GAUGE_VOTES_SORTING_METHODS: Column<GaugeFormattedData>[] = [
  { key: 'weightRelative', label: 'Weight' },
  { key: 'weightRelativeDelta7d', label: '7d Delta' },
  { key: 'weightRelativeDelta60d', label: '60d Delta' },
]
