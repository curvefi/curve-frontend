import { Column } from '@/components/PaginatedTable'

export const GAUGE_VOTES_TABLE_LABELS: Column<GaugeVoteData>[] = [
  { key: 'timestamp', label: 'Date' },
  { key: 'weight', label: 'Vote Weight' },
  { key: 'user', label: 'User', disabled: true },
]
