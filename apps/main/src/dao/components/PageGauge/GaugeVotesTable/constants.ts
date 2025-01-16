import { Column } from '@/dao/components/PaginatedTable'

export const GAUGE_VOTES_TABLE_LABELS: Column<GaugeVote>[] = [
  { key: 'timestamp', label: 'Date' },
  { key: 'weight', label: 'Vote Weight' },
  { key: 'user', label: 'User', disabled: true },
]
