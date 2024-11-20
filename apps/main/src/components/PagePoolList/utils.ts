import type { SearchTermsFuseResult } from '@/shared/curve-lib'
import type { SearchTermsResult } from '@/components/PagePoolList/types'

import isUndefined from 'lodash/isUndefined'
import startsWith from 'lodash/startsWith'
import union from 'lodash/union'

export function isStartPartOrEnd(searchString: string, string: string) {
  return startsWith(string, searchString) || string.includes(searchString) || string === searchString
}

export function getRewardsApyStr(
  rewardsApyMapper: RewardsApyMapper | undefined,
  rewardsApyMapperCached: RewardsApyMapper | undefined
) {
  if (!isUndefined(rewardsApyMapper) || !isUndefined(rewardsApyMapperCached)) {
    const rewardsApyKeys = Object.keys(rewardsApyMapper ?? {})
    const rewardsApyCacheKeys = Object.keys(rewardsApyMapperCached ?? {})
    return union(rewardsApyKeys, rewardsApyCacheKeys).join(',')
  }
}

export function getUserPoolListStr(userPoolList: UserPoolListMapper | undefined) {
  return Object.keys(userPoolList ?? {}).join(',') ?? ''
}

export function parseSearchTermResults(searchedTermsResults: SearchTermsFuseResult<PoolData | PoolDataCache>) {
  return searchedTermsResults.reduce((prev, r) => {
    if (!r.matches) return prev
    prev[r.item.pool.id] = r.matches.reduce((prev, { key, value = '' }) => {
      if (!key || !value) return prev
      prev[key] = { value }
      return prev
    }, {} as { [k: string]: { value: string } })
    return prev
  }, {} as SearchTermsResult)
}
