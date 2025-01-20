import { Column } from '@dao/components/PaginatedTable'
import { UserGaugeVoteWeight } from '@dao/types/dao.types'

export const USER_VOTES_TABLE_LABELS: Column<UserGaugeVoteWeight>[] = [
  { key: 'title', label: 'Gauge', disabled: true },
  { key: 'userPower', label: 'User Weight' },
  { key: 'userVeCrv', label: 'veCRV used' },
]
