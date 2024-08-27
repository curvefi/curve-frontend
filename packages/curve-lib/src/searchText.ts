import Fuse from 'fuse.js'
import FuseResult = Fuse.FuseResult

export type SearchTermsFuseResult<T> = FuseResult<T>[]

function uniqueResult<T>(results: SearchTermsFuseResult<T>): SearchTermsFuseResult<T> {
  return Array.from(new Set(results.map((item) => JSON.stringify(item)))).map((item) => JSON.parse(item))
}

function groupSearchTerms(searchText: string) {
  const defaultGrouped: { addresses: string[]; tokens: string[] } = { addresses: [], tokens: [] }

  return searchText.split(/[, ]+/).reduce((prev, t) => {
    let term = t.toLowerCase()
    if (term.startsWith('0x')) {
      prev.addresses.push(t)
    } else {
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
    threshold: 0.0,
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
function searchByAddresses<T>(searchTerms: string[], datas: T[], keys: string[]) {
  const fuse = new Fuse<T>(datas, {
    ignoreLocation: true,
    includeMatches: true,
    minMatchCharLength: 4,
    threshold: 0.01,
    keys,
  })

  let results: Fuse.FuseResult<T>[] = []
  searchTerms.forEach((term) => {
    results = [...results, ...fuse.search(term)]
  })

  return uniqueResult(results)
}

export function searchByText<T>(searchText: string, datas: T[], tokenKeys: string[], addressKeys: string[]) {
  const { addresses, tokens } = groupSearchTerms(searchText)

  return {
    tokensResult: tokens.length > 0 ? searchByTokens(tokens, datas, tokenKeys) : [],
    addressesResult: addresses.length > 0 ? searchByAddresses(addresses, datas, addressKeys) : [],
  }
}
