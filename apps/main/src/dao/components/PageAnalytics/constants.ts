import { TopHoldersSortBy } from '@/dao/types/dao.types'

export const TOP_HOLDERS_FILTERS: { key: TopHoldersSortBy; label: string }[] = [
  { key: 'weightRatio', label: '% veCRV' },
  { key: 'weight', label: 'veCRV' },
  { key: 'locked', label: 'Locked CRV' },
]
