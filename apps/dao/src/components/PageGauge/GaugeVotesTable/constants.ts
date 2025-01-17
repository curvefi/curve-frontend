import { Column } from '@/components/PaginatedTable'
import { GaugeVote } from '@/types/dao.types'

export const GAUGE_VOTES_TABLE_LABELS: Column<GaugeVote>[] = [
  { key: 'timestamp', label: 'Date' },
  { key: 'weight', label: 'Vote Weight' },
  { key: 'user', label: 'User', disabled: true },
]
