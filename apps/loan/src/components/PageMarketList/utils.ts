import type { SearchParams, SearchTermsResult } from '@loan/components/PageMarketList/types'
import type { SearchTermsFuseResult } from '@ui-kit/utils'
import { CollateralData } from '@loan/types/loan.types'

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  sortBy: 'totalBorrowed',
  sortByOrder: 'desc',
  searchText: '',
}

export function parseSearchTermResults(searchedTermsResults: SearchTermsFuseResult<CollateralData>) {
  return searchedTermsResults.reduce((prev, r) => {
    if (!r.matches) return prev
    prev[r.item.llamma.id] = r.matches.reduce(
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
