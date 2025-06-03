import { enforce, group, test } from 'vest'
import { invalidateUserLendingVaultEarnings } from '@/loan/entities/lending-vaults'
import { ChainId } from '@/loan/types/loan.types'
import type { LlamaApi } from '@/loan/types/loan.types'
import { Chain as ChainName } from '@curvefi/prices-api'
import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { type ChainParams, type ChainQuery, queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { apiValidationGroup, chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { type Address } from '@ui-kit/utils'
import networks from '../networks'

/**
 * Fetches the user's lending supplies across all chains.
 * This query is kept out of lending-vaults.ts because that is used as a server-side query, where no wallet is available.
 */
const {
  getQueryOptions: getUserLendingSuppliesQueryOptions,
  getQueryData: getCurrentUserLendingSupplies,
  invalidate: invalidateUserLendingSupplies,
} = queryFactory({
  queryKey: ({ chainId, userAddress }: UserParams & ChainParams<ChainId>) =>
    ['user-lending-supplies', { chainId }, { userAddress }, 'v2'] as const,
  queryFn: async (_: UserQuery & ChainQuery<ChainId>) => {
    const api = requireLib<LlamaApi>()
    await api.lendMarkets.fetchMarkets()
    return {
      // todo: multi-chain not supported
      [networks[api.chainId].name]: Object.fromEntries(
        await Promise.all(
          api.lendMarkets.getMarketList().map(async (name) => {
            const { addresses, vault, wallet } = api.getLendMarket(name)
            const { vaultShares } = await wallet.balances()
            return [addresses.controller, +vaultShares && +(await vault.convertToAssets(vaultShares))]
          }),
        ),
      ),
    } as Record<ChainName, Record<Address, number>>
  },
  validationSuite: createValidationSuite(({ chainId, userAddress }: UserParams & ChainParams<ChainId>) => {
    userAddressValidationGroup({ userAddress })
    chainValidationGroup({ chainId })
    apiValidationGroup({ chainId })
    group('userAddressLibCheck', () => {
      test('userAddress', 'Invalid EVM address', () => {
        const lib = getLib<LlamaApi>()
        if (userAddress && lib) {
          enforce(userAddress).equals(lib.signerAddress)
        }
      })
    })
  }),
})

export function invalidateAllUserLendingSupplies(userAddress: Address | undefined) {
  Object.entries(getCurrentUserLendingSupplies({ userAddress }) ?? {}).forEach(([chain, positions]) => {
    invalidateUserLendingSupplies({ userAddress })
    const blockchainId = chain as ChainName
    ;(Object.keys(positions) as Address[]).forEach((contractAddress) => {
      invalidateUserLendingVaultEarnings({ userAddress, blockchainId, contractAddress })
    })
  })
}

export const getUserLendingSuppliesOptions = getUserLendingSuppliesQueryOptions
