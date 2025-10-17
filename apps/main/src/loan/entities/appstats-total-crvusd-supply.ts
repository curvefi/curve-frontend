import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { decimal } from '@ui-kit/utils'

export const { useQuery: useAppStatsTotalCrvusdSupply } = queryFactory({
  queryKey: () => ['getCrvusdTotalSupplyNumber'] as const,
  queryFn: async () => {
    const resp = await fetch('https://api.curve.finance/api/getCrvusdTotalSupplyNumber')
    return decimal(await resp.text())
  },
  validationSuite: EmptyValidationSuite,
})
