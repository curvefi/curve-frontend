import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { rootKeys, type TokenParams, type TokenQuery } from '@/stellar/queries/root-keys'
import { tokenValidationSuite } from '@/stellar/queries/validation/pool.validation'
import { fetchJson } from '@primitives/fetch.utils'
import { NoRetryError, queryFactory } from '@ui/features/queries/factory'

type AssetPriceResponse = { _embedded: { records: { asset: string; price: number | null }[] } }

const STELLAR_EXPERT_PATHS = { stellar: 'public', 'stellar-testnet': 'testnet' }

export const { useQuery: useTokenUsdRate, getQueryOptions: getTokenUsdRateQueryOptions } = queryFactory({
  queryKey: (params: TokenParams) => [rootKeys.token(params), { name: 'usdRate' }] as const,
  queryFn: async ({ network, token }: TokenQuery) => {
    const { nativeCurrency: nativeCurrency, isTestnet } = STELLAR_NETWORKS[network]
    const { address: nativeAddress, symbol: nativeSymbol } = nativeCurrency
    const isNative = token === nativeAddress
    const path = STELLAR_EXPERT_PATHS[isNative && isTestnet ? 'stellar' : network] // Use the mainnet XLM price as a display reference for native testnet XLM.
    const { _embedded } = await fetchJson<AssetPriceResponse>(
      `https://api.stellar.expert/explorer/${path}/asset/price?asset=${isNative ? nativeSymbol : token}`,
    )

    const { price } = _embedded.records[0] ?? {}
    if (price == null || !Number.isFinite(price) || price <= 0) {
      throw new NoRetryError(`Failed to fetch USD rate for token ${token} on network ${network}`)
    }
    return price
  },
  category: 'global.tokenRate',
  validationSuite: tokenValidationSuite,
})
