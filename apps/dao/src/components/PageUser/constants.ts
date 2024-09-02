import { Column } from '../PaginatedTable'

export const LOCKS_LABELS: Column<UserLock>[] = [
  { key: 'date', label: 'Date' },
  { key: 'lock_type', label: 'Lock Type', disabled: true },
  { key: 'amount', label: 'Amount' },
  { key: 'unlock_time', label: 'Unlock Time' },
]

export const VOTES_LABELS: Column<UserProposalVoteData>[] = [
  { key: 'vote_id', label: 'Vote ID' },
  { key: 'vote_type', label: 'Vote Type', disabled: true },
  { key: 'vote_for', label: 'For Weight' },
  { key: 'vote_against', label: 'Against Weight' },
  { key: 'vote_open', label: 'Start' },
  { key: 'vote_close', label: 'End' },
]

export const GAUGE_VOTES_LABELS: Column<UserGaugeVoteData>[] = [
  { key: 'timestamp', label: 'Date' },
  { key: 'gauge_name', label: 'Gauge Name', disabled: true },
  { key: 'weight', label: 'Weight' },
  { key: 'gauge', label: 'Gauge', disabled: true },
]
