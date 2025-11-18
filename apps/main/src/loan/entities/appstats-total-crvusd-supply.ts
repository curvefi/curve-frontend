import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { decimal } from '@ui-kit/utils'

/**
 * Gets the total supply of crvUSD from the Curve Finance API.
 * It includes the fully supply and is more reliable than on-chain data.
 */
export const { useQuery: useCrvUsdTotalSupply } = queryFactory({
  queryKey: () => ['getCrvusdTotalSupplyNumber'] as const,
  queryFn: async () => {
    const resp = await fetch('https://api.curve.finance/api/getCrvusdTotalSupplyNumber')
    return decimal(await resp.text())
  },
  validationSuite: EmptyValidationSuite,
})
