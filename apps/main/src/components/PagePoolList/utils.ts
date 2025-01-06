import type { SearchTermsFuseResult } from '@ui-kit/utils'
import type { SearchTermsResult } from '@/components/PagePoolList/types'

export enum COLUMN_KEYS {
  'inPool' = 'inPool',
  'poolName' = 'poolName',
  'rewardsLite' = 'rewardsLite',
  'rewardsDesktop' = 'rewardsDesktop',
  'rewardsMobile' = 'rewardsMobile',
  'volume' = 'volume',
  'tvl' = 'tvl',
}

export function parseSearchTermResults<P extends { pool: { id: string } }>(
  searchedTermsResults: SearchTermsFuseResult<P>,
) {
  return searchedTermsResults.reduce((prev, r) => {
    if (!r.matches) return prev
    prev[r.item.pool.id] = r.matches.reduce(
      (prev, { key, value = '' }) => {
        if (!key || !value) return prev
        prev[key] = { value }
        return prev
      },
      {} as { [k: string]: { value: string } },
    )
    return prev
  }, {} as SearchTermsResult)
}
