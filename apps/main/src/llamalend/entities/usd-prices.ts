import { ContractParams, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { contractValidationSuite } from '@ui-kit/lib/model/query/contract-validation'

export const { useQuery: useTokenUsdPrice } = queryFactory({
  queryKey: (params: ContractParams) => [...rootKeys.contract(params), 'usd-price'] as const,
  queryFn: async ({ blockchainId, contractAddress }: ContractParams) => {
    const response = await fetch(`https://prices.curve.finance/v1/usd_price/${blockchainId}/${contractAddress}`)
    const { data } = (await response.json()) as { data: { address: string; usd_price: number; last_updated: string } }
    return data.usd_price
  },
  validationSuite: contractValidationSuite,
})
