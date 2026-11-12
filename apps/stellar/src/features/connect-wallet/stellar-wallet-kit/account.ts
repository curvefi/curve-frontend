import { asAddress, type StellarAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { STELLAR_NETWORKS, type StellarNetwork } from '@/stellar/lib/networks'
import type { NetworkParams, NetworkQuery, UserParams, UserQuery } from '@/stellar/queries/query-types'
import { validateAccount, validateNetwork } from '@/stellar/queries/validation/pool.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { Asset, Horizon, NotFoundError } from '@stellar/stellar-sdk'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'

export const getAccountBalances = async (network: StellarNetwork, account: StellarAddress) => {
  const { horizonUrl, allowHttp, networkPassphrase } = STELLAR_NETWORKS[network]
  const { balances } = await new Horizon.Server(horizonUrl, { allowHttp }).loadAccount(account).catch(error => {
    if (error instanceof NotFoundError) return { balances: [] } // account is not created yet in horizon
    throw error
  })
  return balances.flatMap(balance =>
    notFalsy(
      maybe(
        balance.asset_type === 'native'
          ? Asset.native()
          : balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12'
            ? new Asset(balance.asset_code, balance.asset_issuer)
            : undefined,
        asset => ({
          token: asset.contractId(networkPassphrase) as StellarContract,
          symbol: asset.getCode(),
          balance: balance.balance as Decimal,
        }),
      ),
    ),
  )
}

export const { useQuery: useAccountTokens } = queryFactory({
  queryKey: ({ network, account }: NetworkParams & UserParams) =>
    ({ name: 'accountTokens', network, account }) as const,
  queryFn: async ({ network, account }: NetworkQuery & UserQuery) =>
    (await getAccountBalances(network, account)).map(({ token, ...data }) => ({
      ...data,
      address: asAddress(token),
      chain: network,
    })),
  category: 'global.tokenBalances',
  validationSuite: createValidationSuite(({ network, account }: NetworkQuery & UserQuery) => {
    validateNetwork(network)
    validateAccount(account)
  }),
})
