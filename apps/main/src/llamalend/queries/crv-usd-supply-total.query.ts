import { getCrvUsdSupply } from '@curvefi/prices-api/crvusd'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

/** Just a hunch and best guess on the lookback period, 1 is prob sufficient but might as well take a safer buffer. */
const SUPPLY_LOOKBACK_DAYS = 3

/** Gets the total latest crvUSD supply, no matter the source of the mint */
export const { useQuery: useCrvUsdSupplyTotal } = queryFactory({
  queryKey: () => ['crvusd-supply-total'] as const,
  queryFn: async () => {
    const supply = await getCrvUsdSupply('ethereum', SUPPLY_LOOKBACK_DAYS)
    const latestTimestamp = supply.reduce<number | null>(
      (latest, item) => (latest == null || item.timestamp > latest ? item.timestamp : latest),
      null,
    )

    return latestTimestamp == null
      ? null
      : supply.reduce((total, item) => (item.timestamp === latestTimestamp ? total + item.supply : total), 0)
  },
  category: 'llamalend.appStats',
  validationSuite: EmptyValidationSuite,
})
