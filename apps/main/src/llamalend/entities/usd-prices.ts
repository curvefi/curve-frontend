import { FetchError } from '@curvefi/prices-api/fetch'
import { getUsdPrice } from '@curvefi/prices-api/usd-price'
import { ContractParams, type ContractQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

export const { useQuery: useTokenUsdPrice } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'usd-price'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractQuery) => {
    try {
      const { usdPrice } = await getUsdPrice(blockchainId, contractAddress)
      return usdPrice
    } catch (e) {
      if (e instanceof FetchError && e.status === 404) {
        return // do not retry 404 errors from the prices API
      }
      throw e
    }
  },
  validationSuite: contractValidationSuite,
})
