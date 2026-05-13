import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'

/**
 * Gets the full crvUSD supply from the Curve Finance API, including non-standard mint sources.
 */
export const { useQuery: useCrvUsdTotalSupply } = queryFactory({
  queryKey: () => ['getCrvusdTotalSupplyNumber'] as const,
  queryFn: async () => {
    const resp = await fetch('https://api.curve.finance/api/getCrvusdTotalSupplyNumber')
    return decimal(await resp.text()) ?? null
  },
  category: 'llamalend.appStats',
  validationSuite: EmptyValidationSuite,
})
