import type { Column } from '@/dao/components/PaginatedTable'
import type { UserGaugeVoteFormatted } from '@/dao/entities/user-gauge-votes'
import type { UserLockFormatted } from '@/dao/entities/user-locks'
import type { UserProposalVoteFormatted } from '@/dao/entities/user-proposal-votes'

export const LOCKS_LABELS: Column<UserLockFormatted>[] = [
  { key: 'lockType', label: 'Lock Type', disabled: true },
  { key: 'amount', label: 'Amount' },
  { key: 'timestamp', label: 'Date' },
  { key: 'unlockTime', label: 'Unlock Time' },
]

export const VOTES_LABELS: Column<UserProposalVoteFormatted>[] = [
  { key: 'voteId', label: 'Vote ID' },
  { key: 'voteType', label: 'Vote Type', disabled: true },
  { key: 'voteFor', label: 'For Weight' },
  { key: 'voteAgainst', label: 'Against Weight' },
  { key: 'voteOpen', label: 'Start' },
  { key: 'voteClose', label: 'End' },
]

export const GAUGE_VOTES_LABELS: Column<UserGaugeVoteFormatted>[] = [
  { key: 'gaugeName', label: 'Gauge Name', disabled: true },
  { key: 'timestamp', label: 'Date' },
  { key: 'weight', label: 'Weight' },
  { key: 'gauge', label: 'Gauge', disabled: true },
]
