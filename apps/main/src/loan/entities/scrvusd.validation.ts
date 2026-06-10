import { enforce, skipWhen, test } from 'vest'
import type { ChainId } from '@/loan/types/loan.types'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/evm-address-validation'
import type { UserChainQuery } from '@ui-kit/lib/model/query/root-keys'

export type ScrvUsdUserQuery = UserChainQuery<ChainId>

export type ScrvUsdDepositQuery = ScrvUsdUserQuery & {
  depositAmount: Decimal
  maxDepositAmount?: Decimal
}

export type ScrvUsdDepositMutation = {
  depositAmount: Decimal
  approveInfinite: boolean
}

export type ScrvUsdDepositForm = {
  depositAmount: Decimal | undefined
  approveInfinite: boolean
  maxDepositAmount: Decimal | undefined
}

export type ScrvUsdWithdrawQuery = ScrvUsdUserQuery & {
  withdrawAmount: Decimal
  isFull: boolean | undefined
  maxWithdrawAmount: Decimal
}

export type ScrvUsdWithdrawMutation = {
  withdrawAmount: Decimal
  isFull: boolean | undefined
  maxWithdrawAmount: Decimal
}

export type ScrvUsdWithdrawForm = Partial<ScrvUsdWithdrawMutation> & {
  maxWithdrawAmount?: Decimal
}

export type ScrvUsdUserParams = FieldsOf<ScrvUsdUserQuery>
export type ScrvUsdDepositParams = FieldsOf<ScrvUsdDepositQuery>
export type ScrvUsdWithdrawParams = FieldsOf<ScrvUsdWithdrawQuery>

const validateRequiredDecimal = (field: 'depositAmount' | 'withdrawAmount', value: unknown) => {
  test(field, `${field} is required`, () => {
    enforce(value).isNotEmpty()
  })
  test(field, `${field} must be a positive number`, () => {
    enforce(value).isDecimal().gt(0)
  })
}

const validateMaxDecimal = (
  field: 'depositAmount' | 'withdrawAmount',
  value: Decimal | null | undefined,
  max: Decimal | null | undefined,
  maxRequired: boolean,
) => {
  skipWhen(!maxRequired, () => {
    test(field, `Maximum ${field} must be available`, () => {
      enforce(max).isNotEmpty()
    })
  })
  skipWhen(value == null || max == null, () => {
    test(field, `Amount exceeds maximum of ${max}`, () => {
      enforce(value).lte(max)
    })
  })
}

export const scrvUsdUserValidationSuite = createValidationSuite((params: ScrvUsdUserParams) => {
  llamaApiValidationGroup(params)
  userAddressValidationGroup({ userAddress: params.userAddress })
})

const createScrvUsdDepositValidationSuite = ({
  validateMax,
  maxRequired = validateMax,
}: {
  validateMax: boolean
  maxRequired?: boolean
}) =>
  createValidationSuite((params: ScrvUsdDepositParams) => {
    llamaApiValidationGroup(params)
    userAddressValidationGroup({ userAddress: params.userAddress })
    validateRequiredDecimal('depositAmount', params.depositAmount)
    skipWhen(!validateMax, () => {
      validateMaxDecimal('depositAmount', params.depositAmount, params.maxDepositAmount, maxRequired)
    })
  })

export const scrvUsdDepositValidationSuite = createScrvUsdDepositValidationSuite({ validateMax: false })
export const scrvUsdDepositMaxValidationSuite = createScrvUsdDepositValidationSuite({ validateMax: true })

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

const createScrvUsdWithdrawValidationSuite = ({
  validateMax,
  maxRequired = validateMax,
}: {
  validateMax: boolean
  maxRequired?: boolean
}) =>
  createValidationSuite((params: ScrvUsdWithdrawParams) => {
    llamaApiValidationGroup(params)
    userAddressValidationGroup({ userAddress: params.userAddress })
    validateRequiredDecimal('withdrawAmount', params.withdrawAmount)

    test('isFull', 'Full withdraw value must be calculated', () => {
      enforce(params.isFull).isBoolean()
    })
    skipWhen(!validateMax, () => {
      validateMaxDecimal('withdrawAmount', params.withdrawAmount, params.maxWithdrawAmount, maxRequired)
    })
  })

export const scrvUsdWithdrawValidationSuite = createScrvUsdWithdrawValidationSuite({ validateMax: false })
export const scrvUsdWithdrawMaxValidationSuite = createScrvUsdWithdrawValidationSuite({ validateMax: true })

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
