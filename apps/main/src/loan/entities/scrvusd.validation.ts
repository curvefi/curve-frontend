import { enforce, skipWhen, test } from 'vest'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/evm-address-validation'
import type { ChainQuery, UserChainQuery } from '@ui-kit/lib/model/query/root-keys'

export type ScrvUsdChainQuery<ChainId = number> = ChainQuery<ChainId>
export type ScrvUsdUserQuery<ChainId = number> = UserChainQuery<ChainId>

export type ScrvUsdDepositQuery<ChainId = number> = ScrvUsdUserQuery<ChainId> & {
  depositAmount: Decimal
}

export type ScrvUsdDepositMutation = {
  depositAmount: Decimal
  approveInfinite: boolean
}

export type ScrvUsdDepositForm = Partial<ScrvUsdDepositMutation> & {
  maxDepositAmount?: Decimal
}

export type ScrvUsdWithdrawQuery<ChainId = number> = ScrvUsdUserQuery<ChainId> & {
  withdrawAmount: Decimal
  isFull: boolean | undefined
  userVaultShares: Decimal
}

export type ScrvUsdWithdrawMutation = {
  withdrawAmount: Decimal
  isFull: boolean | undefined
  userVaultShares: Decimal
}

export type ScrvUsdWithdrawForm = Partial<ScrvUsdWithdrawMutation> & {
  maxWithdrawAmount?: Decimal
}

export type ScrvUsdChainParams<ChainId = number> = FieldsOf<ScrvUsdChainQuery<ChainId>>
export type ScrvUsdUserParams<ChainId = number> = FieldsOf<ScrvUsdUserQuery<ChainId>>
export type ScrvUsdDepositParams<ChainId = number> = FieldsOf<ScrvUsdDepositQuery<ChainId>>
export type ScrvUsdWithdrawParams<ChainId = number> = FieldsOf<ScrvUsdWithdrawQuery<ChainId>>

const validateRequiredDecimal = (field: 'depositAmount' | 'withdrawAmount' | 'userVaultShares', value: unknown) => {
  test(field, `${field} is required`, () => {
    enforce(value).isNotEmpty()
  })
  test(field, `${field} must be a positive number`, () => {
    enforce(value).isDecimal().gt(0)
  })
}

export const scrvUsdUserValidationSuite = createValidationSuite((params: ScrvUsdUserParams) => {
  llamaApiValidationGroup(params)
  userAddressValidationGroup({ userAddress: params.userAddress })
})

export const scrvUsdDepositValidationSuite = createValidationSuite((params: ScrvUsdDepositParams) => {
  llamaApiValidationGroup(params)
  userAddressValidationGroup({ userAddress: params.userAddress })
  validateRequiredDecimal('depositAmount', params.depositAmount)
})

export const scrvUsdDepositFormValidationSuite = createValidationSuite(
  ({ depositAmount, maxDepositAmount }: ScrvUsdDepositForm) => {
    test('depositAmount', 'Deposit amount is required', () => {
      enforce(depositAmount).isNotEmpty()
    })
    skipWhen(!depositAmount, () => {
      test('depositAmount', 'Deposit amount must be a positive number', () => {
        enforce(depositAmount).isDecimal().gt(0)
      })
    })
    skipWhen(depositAmount == null || maxDepositAmount == null, () => {
      test('depositAmount', `Amount exceeds maximum of ${maxDepositAmount}`, () => {
        enforce(depositAmount).lte(maxDepositAmount)
      })
    })
  },
)

export const scrvUsdWithdrawValidationSuite = createValidationSuite((params: ScrvUsdWithdrawParams) => {
  llamaApiValidationGroup(params)
  userAddressValidationGroup({ userAddress: params.userAddress })
  validateRequiredDecimal('withdrawAmount', params.withdrawAmount)

  test('isFull', 'Full withdraw value must be calculated', () => {
    enforce(params.isFull).isBoolean()
  })

  if (params.isFull) {
    validateRequiredDecimal('userVaultShares', params.userVaultShares)
  }
})

export const scrvUsdWithdrawFormValidationSuite = createValidationSuite(
  ({ withdrawAmount, maxWithdrawAmount, isFull }: ScrvUsdWithdrawForm) => {
    test('withdrawAmount', 'Withdraw amount is required', () => {
      enforce(withdrawAmount).isNotEmpty()
    })
    skipWhen(!withdrawAmount, () => {
      test('withdrawAmount', 'Withdraw amount must be a positive number', () => {
        enforce(withdrawAmount).isDecimal().gt(0)
      })
    })
    skipWhen(withdrawAmount == null || maxWithdrawAmount == null, () => {
      test('withdrawAmount', `Amount exceeds maximum of ${maxWithdrawAmount}`, () => {
        enforce(withdrawAmount).lte(maxWithdrawAmount)
      })
    })
    test('isFull', 'Full withdraw value must be calculated', () => {
      enforce(isFull).isBoolean()
    })
  },
)
