import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { TokenParams, TokenQuery } from '@/stellar/queries/query-types'
import { tokenValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { FetchError, fetchJson } from '@primitives/fetch.utils'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'

/** This is part of the response from the stellar api, it only includes the used fields **/
type AssetPriceResponse = {
  _embedded: {
    records: {
      /** Price is also in the response but seems older than the 7d array. **/
      price: number | null
      /** prices for the last 7 days, current is the last one, tuple has raw and formatted values **/
      price7d: [number, number][] | null
    }[]
  }
}

const STELLAR_EXPERT_PATHS = { stellar: 'public', 'stellar-testnet': 'testnet' }

export const { useQuery: useTokenUsdRate, getQueryOptions: getTokenUsdRateQueryOptions } = queryFactory({
  queryKey: ({ network, token }: TokenParams) => ({ name: 'usdRate', network, token }) as const,
  queryFn: async ({ network, token }: TokenQuery) => {
    const { nativeCurrency: nativeCurrency, isTestnet } = STELLAR_NETWORKS[network]
    const { address: nativeAddress, symbol: nativeSymbol } = nativeCurrency
    const isNative = token === nativeAddress
    if (isTestnet && !isNative) return 1 // our generated testnet pools use fake USD-based tokens
    const path = STELLAR_EXPERT_PATHS[isNative && isTestnet ? 'stellar' : network] // Use the mainnet XLM price as a display reference for native testnet XLM.
    const {
      _embedded: { records },
    } = await fetchJson<AssetPriceResponse>(
      `https://api.stellar.expert/explorer/${path}/asset?search=${isNative ? nativeSymbol : token}&limit=1`,
    ).catch(e => {
      if (e instanceof FetchError) throw new NoRetryError(e.message) // fetchJson has its own retries, stop so we don't get rate limited.
      throw e
    })

    const [first] = records ?? []
    const price = first.price7d?.at(-1)?.[1] ?? first.price
    if (price) return price
    throw new NoRetryError(`Failed to fetch USD rate for token ${token} on network ${network}`)
  },
  category: 'global.tokenRate',
  validationSuite: tokenValidationSuite,
})
