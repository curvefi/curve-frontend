import { Column } from '@/components/PaginatedTable'

export const GAUGE_VOTES_TABLE_LABELS: Column<GaugeFormattedData>[] = [
  { key: 'title', label: 'Gauge', disabled: true },
  { key: 'gauge_relative_weight', label: 'Weight' },
  { key: 'gauge_relative_weight_7d_delta', label: '7d Delta' },
  { key: 'gauge_relative_weight_60d_delta', label: '60d Delta' },
]
