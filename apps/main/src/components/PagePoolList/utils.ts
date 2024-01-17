import startsWith from 'lodash/startsWith'
import union from 'lodash/union'
import isUndefined from 'lodash/isUndefined'

export function isStartPartOrEnd(searchString: string, string: string) {
  return startsWith(string, searchString) || string.includes(searchString) || string === searchString
}

export function parsedSearchTextToList(searchText: string) {
  return searchText
    .toLowerCase()
    .split(searchText.indexOf(',') !== -1 ? ',' : ' ')
    .filter((st) => st !== '')
    .map((st) => st.trim())
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
