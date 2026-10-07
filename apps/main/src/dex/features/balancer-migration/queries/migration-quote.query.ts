import { group, test } from 'vest'
import type { UserChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import {
  evmAddressValidationGroup,
  userAddressValidationGroup,
} from '@evm-ui/queries/validation/evm-address-validation'
import type { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'
import { fetchMigrationRoute } from '../api/migration-route.api'

/** `amountIn` is a raw-unit string because query keys cannot hold bigints. */
export type MigrationQuoteQuery = UserChainQuery & {
  tokenIn: Address
  tokenOut: Address
  amountIn: string
  slippageBps: number
}
export type MigrationQuoteParams = FieldsOf<MigrationQuoteQuery>

export const migrationQuoteValidationSuite = createValidationSuite((params: MigrationQuoteParams) => {
  chainValidationGroup(params)
  userAddressValidationGroup(params)
  evmAddressValidationGroup({ evmAddress: params.tokenIn, fieldName: 'tokenIn' })
  evmAddressValidationGroup({ evmAddress: params.tokenOut, fieldName: 'tokenOut' })
  group('migrationAmount', () => {
    test('amountIn', 'Amount must be positive', () => {
      enforce(/^\d+$/.test(params.amountIn ?? '') && BigInt(params.amountIn!) > 0n).equals(true)
    })
    test('slippageBps', 'Slippage must be between 0.01% and 50%', () => {
      enforce(params.slippageBps).isNumber().gte(1).lte(5000)
    })
  })
})

export const { useQuery: useMigrationQuote, fetchQuery: fetchMigrationQuote } = queryFactory({
  queryKey: ({ chainId, userAddress, tokenIn, tokenOut, amountIn, slippageBps }: MigrationQuoteParams) =>
    ({ name: 'balancerMigrationQuote', chainId, userAddress, tokenIn, tokenOut, amountIn, slippageBps }) as const,
  queryFn: ({ chainId, userAddress, tokenIn, tokenOut, amountIn, slippageBps }: MigrationQuoteQuery) =>
    fetchMigrationRoute({ chainId, userAddress, tokenIn, tokenOut, amountIn: BigInt(amountIn), slippageBps }),
  category: 'dex.deposit',
  validationSuite: migrationQuoteValidationSuite,
})
