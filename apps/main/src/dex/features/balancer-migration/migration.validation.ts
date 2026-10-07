import { group, skipWhen, test } from 'vest'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import {
  evmAddressValidationGroup,
  userAddressValidationGroup,
} from '@evm-ui/queries/validation/evm-address-validation'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { Nullish } from '@primitives/objects.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import type { FieldsOf } from '@ui/lib/validation/types'

export type MigrationForm = {
  /** Balancer LP amount in token units. */
  amount: Decimal | undefined
  maxAmount: Decimal | undefined
  targetLpToken: Address | undefined
  slippage: Decimal
}

/** `tokenIn` is the Balancer LP token, `tokenOut` the Curve LP token. */
export type MigrationQuery = {
  chainId: number
  userAddress: Address
  tokenIn: Address
  tokenOut: Address
  amount: Decimal
  slippage: Decimal
}
export type MigrationParams = FieldsOf<MigrationQuery>

const validateAmount = ({ amount, maxAmount }: { amount: Decimal | Nullish; maxAmount: Decimal | Nullish }) =>
  group('amountValidation', () => {
    test('amount', 'Enter an amount to migrate', () => {
      enforce(amount).isDecimal().gt(0)
    })
    skipWhen(maxAmount == null, () => {
      test('amount', 'Amount exceeds your Balancer LP balance', () => {
        enforce(amount).lte(maxAmount!)
      })
    })
  })

export const migrationFormValidationSuite = createValidationSuite(
  ({ amount, maxAmount, targetLpToken, slippage }: MigrationForm) => {
    validateAmount({ amount, maxAmount })
    evmAddressValidationGroup({ evmAddress: targetLpToken, fieldName: 'targetLpToken' })
    validateSlippage({ slippage })
  },
)

export const migrationQueryValidationSuite = createValidationSuite(
  ({ chainId, userAddress, tokenIn, tokenOut, amount, slippage }: MigrationParams) => {
    chainValidationGroup({ chainId })
    userAddressValidationGroup({ userAddress })
    evmAddressValidationGroup({ evmAddress: tokenIn, fieldName: 'tokenIn' })
    evmAddressValidationGroup({ evmAddress: tokenOut, fieldName: 'tokenOut' })
    validateAmount({ amount, maxAmount: undefined })
    validateSlippage({ slippage })
  },
)
