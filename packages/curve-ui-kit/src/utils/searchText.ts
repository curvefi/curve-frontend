import { isEqualWith, uniqWith } from 'lodash'
import Fuse from 'fuse.js'
import FuseResult = Fuse.FuseResult

export type SearchTermsFuseResult<T> = FuseResult<T>[]

function uniqueResult<T>(results: SearchTermsFuseResult<T>): SearchTermsFuseResult<T> {
  return uniqWith(results, isEqualWith)
}

export function groupSearchTerms(searchText: string) {
  const defaultGrouped: { addresses: string[]; tokens: string[] } = { addresses: [], tokens: [] }

  return searchText
    .trim()
    .split(/[, ]+/)
    .reduce((prev, t) => {
      let term = t.toLowerCase()

      if (term.startsWith('0x')) {
        prev.addresses.push(t)
      } else if (term !== '') {
        prev.tokens.push(t)
      }
      return prev
    }, defaultGrouped)
}

// should only return results if pool/market have all searched tokens
function searchByTokens<T>(searchTerms: string[], datas: T[], keys: string[]) {
  const fuse = new Fuse<T>(datas, {
    ignoreLocation: false,
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.01,
    keys,
  })

  let results: SearchTermsFuseResult<T> = fuse.search(searchTerms[0])
  searchTerms.forEach((term, idx) => {
    if (idx === 0) return
    let termResults = fuse.search(term)
    results = results.filter((r) => termResults.some((termResult) => termResult.item === r.item))
  })

  return uniqueResult(results)
}

// should return any pool/market that have any of the searched addresses
function searchByAddresses<T>(searchTerms: string[], datas: T[], keys: { tokens: string[]; other: string[] }) {
  let uniqueResults: { tokens: SearchTermsFuseResult<T>; other: SearchTermsFuseResult<T> } = { tokens: [], other: [] }

  if (keys.tokens) {
    const fuse = new Fuse<T>(datas, {
      ignoreLocation: true,
      includeMatches: true,
      minMatchCharLength: 4,
      threshold: 0.01,
      keys: keys.tokens,
    })

    let results: Fuse.FuseResult<T>[] = []
    searchTerms.forEach((term) => {
      results = [...results, ...fuse.search(term)]
    })

    uniqueResults.tokens = uniqueResult(results)
  }

  if (keys.other) {
    const fuse = new Fuse<T>(datas, {
      ignoreLocation: true,
      includeMatches: true,
      minMatchCharLength: 4,
      threshold: 0.01,
      keys: keys.other,
    })

    let results: Fuse.FuseResult<T>[] = []
    searchTerms.forEach((term) => {
      results = [...results, ...fuse.search(term)]
    })

    uniqueResults.other = uniqueResult(results)
  }

  return uniqueResults
}

export function searchByText<T>(
  searchText: string,
  datas: T[],
  tokenKeys: string[],
  addressKeys: { tokens: string[]; other: string[] },
) {
  const { addresses, tokens } = groupSearchTerms(searchText)

  const tokensResult = tokens.length > 0 ? searchByTokens(tokens, datas, tokenKeys) : []
  const addressesResult =
    addresses.length > 0 ? searchByAddresses(addresses, datas, addressKeys) : { tokens: [], other: [] }

  return {
    tokensResult: [...tokensResult, ...addressesResult.tokens],
    addressesResult: addressesResult.other,
  }
}
