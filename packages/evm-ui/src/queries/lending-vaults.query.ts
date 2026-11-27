import type { Chain } from '@curvefi/prices-api'
import { getAllMarkets, type Market } from '@curvefi/prices-api/llamalend'
import type { Address } from '@primitives/address.utils'
import { recordEntries } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { mapQuery } from '@ui/features/queries/util'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'

export type LendingVault = Market & { chain: Chain }

export const {
  useQuery: useLendingVaults,
  getQueryOptions: getLendingVaultsOptions,
  reset: resetLendingVaults,
} = queryFactory({
  queryKey: () => ({ name: 'lending-vaults', version: 7 }) as const,
  queryFn: async (): Promise<LendingVault[]> =>
    recordEntries(await getAllMarkets()).flatMap(([chain, markets]) => markets.map(market => ({ ...market, chain }))),
  category: 'llamalend.marketList',
  validationSuite: EmptyValidationSuite,
})

/** Selects a vault by chain and address from the shared lending markets query. */
export const useLendingVault = (
  { blockchainId, vaultAddress }: { blockchainId: Chain | undefined; vaultAddress: Address | undefined },
  enabled?: boolean,
) =>
  mapQuery(useLendingVaults({}, !!blockchainId && !!vaultAddress && enabled), vaults =>
    vaults.find(
      ({ chain, vault }) =>
        enabled !== false && chain === blockchainId && vault.toLowerCase() === vaultAddress?.toLowerCase(),
    ),
  )
