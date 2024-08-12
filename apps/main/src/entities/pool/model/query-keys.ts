import { chainKeys } from '@/entities/chain'

export const poolKeys = {
  root: () => [...chainKeys.root(), 'pool'] as const,
  lists: () => [...poolKeys.root(), 'list'] as const,
  list: (filters: string) => [...poolKeys.lists(), filters] as const,
} as const
