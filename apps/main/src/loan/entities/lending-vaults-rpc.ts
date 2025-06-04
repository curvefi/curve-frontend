import { enforce, group, test } from 'vest'
import { fetchTokenUsdRate } from '@/lend/entities/token'
import {
  fetchLendingVaults,
  fetchUserLendingVaultEarnings,
  invalidateUserLendingVaultEarnings,
} from '@/loan/entities/lending-vaults'
import type { LlamaApi } from '@/loan/types/loan.types'
import { ChainId } from '@/loan/types/loan.types'
import { Chain as ChainName } from '@curvefi/prices-api'
import { getLib, requireLib } from '@ui-kit/features/connect-wallet'
import { type ChainQuery, queryFactory, UserParams, type UserQuery } from '@ui-kit/lib/model/query'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { type Address } from '@ui-kit/utils'
import { fromEntries, notFalsy, objectKeys, recordEntries } from '@ui-kit/utils/objects.util'
import networks from '../networks'

type EarningsResult = {
  claimableRewards: { token: Address; symbol: string; amount: number; amountUsd: number }[]
  claimableCrv: number
  deposited: number
  depositedUsd: number
}

async function getEarningsViaLlamalendJs(api: LlamaApi): Promise<Record<Address, EarningsResult>> {
  const { chainId, lendMarkets } = api
  await lendMarkets.fetchMarkets()
  const marketNames = lendMarkets.getMarketList()
  const entries = await Promise.allSettled(
    marketNames.map(async (name) => {
      const { addresses, vault, wallet, borrowed_token } = api.getLendMarket(name)
      const [{ vaultShares, gauge }, borrowedRate, crvRewards, rewards] = await Promise.all([
        wallet.balances().catch((e) => {
          console.warn(`Llama lend market ${name} earnings: No wallet balances found`, e)
          return { vaultShares: 0, gauge: 0 }
        }),
        fetchTokenUsdRate({ chainId, tokenAddress: borrowed_token.address }),
        vault.claimableCrv().catch((e) => {
          console.warn(`Llama lend market ${name} earnings: No claimable CRV found`, e)
          return 0
        }), // TODO: Check when we can call this
        vault.claimableRewards().catch((e) => {
          console.warn(`Llama lend market ${name} earnings: No claimable rewards found`, e)
          return []
        }), // TODO: Check when we can call this
      ])
      let pricePerShare: string | number = 0
      if (+vaultShares || +gauge) {
        pricePerShare = await vault.previewRedeem(1).catch((e) => {
          console.warn(`Llama lend market ${name} earnings: No price per share found`, e)
          return 0
        }) // TODO: Check when we can call this
      }

      const [convertedShares, ...rewardUsdPrices] = await Promise.all([
        vault.convertToAssets(vaultShares),
        ...rewards.map(
          async (r) => [r.token as Address, await fetchTokenUsdRate({ chainId, tokenAddress: r.token })] as const,
        ),
      ])
      const usdPrices = fromEntries(rewardUsdPrices)

      const totalShares = +gauge + +convertedShares
      const result: EarningsResult = {
        deposited: +pricePerShare * +totalShares,
        depositedUsd: +pricePerShare * +totalShares * +borrowedRate,
        claimableRewards: rewards
          .map(({ token, amount, symbol }) => ({
            symbol,
            amount: +amount,
            amountUsd: +amount * +usdPrices[token as Address],
            token: token as Address,
          }))
          .filter(({ amount }) => amount > 0),
        claimableCrv: +crvRewards * +borrowedRate,
      }
      return [addresses.controller, result] as const
    }),
  )
  const errors = notFalsy(...entries.map((e, i) => e.status === 'rejected' && ([marketNames[i], e.reason] as const)))
  if (errors.length) {
    console.error(`Errors fetching earnings for markets (${errors.length}/${marketNames.length}):`, errors)
  }
  return fromEntries(
    notFalsy(...entries.map((e) => e.status === 'fulfilled' && e.value)).filter(
      ([_, { claimableRewards, claimableCrv, deposited }]) => deposited || claimableCrv || claimableRewards.length,
    ),
  )
}

async function fetchViaPricesApi(currentChain: ChainName, userAddress: Address) {
  const vaults = await fetchLendingVaults({})
  const filtered = vaults.filter(({ chain }) => chain !== currentChain)
  const entries = await Promise.all(
    filtered.map(
      async ({ controller, vault: contractAddress, chain: blockchainId, borrowedBalance, borrowedBalanceUsd }) => {
        const params = { userAddress, contractAddress, blockchainId }
        const { deposited } = (await fetchUserLendingVaultEarnings(params)) ?? {}
        const data = deposited && {
          deposited,
          depositedUsd: deposited * (borrowedBalance / borrowedBalanceUsd),
          claimableRewards: [],
          claimableCrv: 0,
        }
        return [blockchainId, controller, data] as const
      },
    ),
  )
  return entries.reduce(
    (acc, [chain, controller, data]) => ({
      ...acc,
      [chain]: { ...acc[chain], ...(data && { [controller]: data }) },
    }),
    {} as Record<ChainName, Record<Address, EarningsResult>>,
  )
}

/**
 * Fetches the user's lending supplies across all chains.
 * This query is kept out of lending-vaults.ts because that is used as a server-side query, where no wallet is available.
 */
const {
  getQueryOptions: getUserLendingSuppliesQueryOptions,
  getQueryData: getCurrentUserLendingSupplies,
  invalidate: invalidateUserLendingSupplies,
  useQuery: useUserLendingSuppliesQuery,
} = queryFactory({
  queryKey: ({ userAddress }: UserParams) => ['user-lending-supplies', { userAddress }, 'v2'] as const,
  queryFn: async ({
    userAddress,
  }: UserQuery & ChainQuery<ChainId>): Promise<Record<ChainName, Record<Address, EarningsResult>>> => {
    if (!getLib<LlamaApi>()) debugger
    const api = requireLib<LlamaApi>()
    const currentChain = networks[api.chainId].id as ChainName
    const [activeNetwork, otherNetworks] = await Promise.all([
      getEarningsViaLlamalendJs(api),
      fetchViaPricesApi(currentChain, userAddress),
    ])
    return { ...otherNetworks, [currentChain]: activeNetwork }
  },
  validationSuite: createValidationSuite(({ userAddress }: UserParams) => {
    userAddressValidationGroup({ userAddress })
    group('apiValidation', () => {
      const lib = getLib<LlamaApi>()
      test('api', 'should be loaded', () => {
        enforce(lib).message('API is null').isNotNullish()
      })
      test('userAddress', 'invalid signer address', () => {
        if (userAddress && lib) {
          enforce(userAddress).equals(lib.signerAddress)
        }
      })
    })
  }),
})

export function invalidateAllUserLendingSupplies(userAddress: Address | undefined) {
  recordEntries(getCurrentUserLendingSupplies({ userAddress }) ?? {}).forEach(([blockchainId, positions]) => {
    invalidateUserLendingSupplies({ userAddress })
    objectKeys(positions).forEach((contractAddress) =>
      invalidateUserLendingVaultEarnings({
        userAddress,
        blockchainId,
        contractAddress,
      }),
    )
  })
}

export const getUserLendingSuppliesOptions = getUserLendingSuppliesQueryOptions
export const useUserLendingSupplies = useUserLendingSuppliesQuery
