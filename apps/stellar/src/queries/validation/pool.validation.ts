import { test } from 'vest'
import type { StellarAddress } from '@/stellar/features/connect-wallet/address'
import { isAccountAddress, isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { PoolParams, TokenQuery, UserQuery } from '@/stellar/queries/root-keys'
import type { Nullish } from '@primitives/objects.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

export type { PoolQuery, PoolParams, TokenQuery } from '@/stellar/queries/root-keys'
export type BalanceQuery = TokenQuery & UserQuery & { decimals: number }
export type BalanceParams = FieldsOf<BalanceQuery>

export const validateNetwork = (network: string | Nullish) => {
  test('network', 'Unsupported Stellar network', () => {
    enforce(network).inside(Object.keys(STELLAR_NETWORKS))
  })
}
export const validateAccount = (account: StellarAddress | Nullish) => {
  test('account', 'Connect a Stellar wallet', () => {
    enforce(account).isNotEmpty().condition(isAccountAddress)
  })
}
export const validatePool = ({ network, pool }: PoolParams) => {
  validateNetwork(network)
  test('pool', 'Invalid Stellar pool address', () => {
    enforce(pool).isNotEmpty().condition(isContractAddress)
  })
}
const validateToken = ({ network, token }: TokenQuery) => {
  validateNetwork(network)
  test('token', 'Invalid Stellar token address', () => {
    enforce(token).isNotEmpty().condition(isContractAddress)
  })
}

export const poolValidationSuite = createValidationSuite(validatePool)
export const tokenValidationSuite = createValidationSuite(validateToken)
export const balanceValidationSuite = createValidationSuite(({ network, token, account, decimals }: BalanceQuery) => {
  validateToken({ network, token })
  validateAccount(account)
  test('decimals', 'Token decimals are unavailable', () => {
    enforce(decimals).isNumber()
  })
})
