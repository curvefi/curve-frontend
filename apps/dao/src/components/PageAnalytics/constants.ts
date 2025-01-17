import { TopHoldersSortBy } from '@/types/dao.types'

export const TOP_HOLDERS_FILTERS: { key: TopHoldersSortBy; label: string }[] = [
  { key: 'weight_ratio', label: '% veCRV' },
  { key: 'weight', label: 'veCRV' },
  { key: 'locked', label: 'Locked CRV' },
]
