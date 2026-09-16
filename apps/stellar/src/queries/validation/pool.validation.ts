import { test } from 'vest'
import type { StellarAddress } from '@/stellar/features/connect-wallet/address'
import { isAccountAddress, isContractAddress } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import type { PoolQuery, TokenQuery, UserQuery } from '@/stellar/queries/root-keys'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

export type { PoolQuery, PoolParams, TokenQuery, TokenParams } from '@/stellar/queries/root-keys'
export type BalanceQuery = TokenQuery & UserQuery & { decimals: number }
export type BalanceParams = FieldsOf<BalanceQuery>

export const validateNetwork = (network: string) => {
  test('network', 'Unsupported Stellar network', () => {
    enforce(!!network && network in STELLAR_NETWORKS).isTruthy()
  })
}
export const validateAccount = (account: StellarAddress | undefined) => {
  test('account', 'Connect a Stellar wallet', () => {
    enforce(!!account && isAccountAddress(account)).isTruthy()
  })
}
export const validatePool = ({ network, pool }: PoolQuery) => {
  validateNetwork(network)
  test('pool', 'Invalid Stellar pool address', () => {
    enforce(!!pool && isContractAddress(pool)).isTruthy()
  })
}
const validateToken = ({ network, token }: TokenQuery) => {
  validateNetwork(network)
  test('token', 'Invalid Stellar token address', () => {
    enforce(!!token && isContractAddress(token)).isTruthy()
  })
}

export const poolValidationSuite = createValidationSuite(validatePool)
export const tokenValidationSuite = createValidationSuite(validateToken)
export const balanceValidationSuite = createValidationSuite((params: BalanceQuery) => {
  validateToken(params)
  validateAccount(params.account)
  test('decimals', 'Token decimals are unavailable', () => {
    enforce(params.decimals).isNumber()
  })
})
