import { FetchError } from '@curvefi/prices-api/fetch'
import { getUsdPrice } from '@curvefi/prices-api/usd-price'
import { ContractParams, type ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

/**
 * Retrieves the usd price for a given token contract from the prices API.
 * This is less efficient than `useTokenUsdRate` because it requires a HTTP request per token.
 * However, it works multi-chain and without llamalend-js being initialized (which requires a wallet).
 * @returns The USD price of the token, or undefined if not found.
 */
export const { useQuery: useTokenUsdPrice, getQueryOptions: getTokenUsdPriceQueryOptions } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'usd-price'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery) => {
    try {
      const { usdPrice } = await getUsdPrice(blockchainId, contractAddress)
      return usdPrice
    } catch (e) {
      if (e instanceof FetchError && e.status === 404) {
        return null // do not retry 404 errors from the prices API
      }
      throw e
    }
  },
  validationSuite: contractValidationSuite,
})
