import BigNumber from 'bignumber.js'
import { enforce, group, test } from 'vest'
import {
  validateIsFull,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type {
  CollateralHealthParams,
  CollateralParams,
  RepayFromCollateralHealthParams,
  RepayFromCollateralParams,
} from '@/llamalend/queries/validation/manage-loan.types'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { Decimal } from '@ui-kit/utils'

export type CollateralForm = FieldsOf<{ userCollateral: Decimal }>

export type RepayForm = FieldsOf<{
  stateCollateral: Decimal
  userCollateral: Decimal
  userBorrowed: Decimal
}>

const validateRepayCollateralField = (field: 'stateCollateral' | 'userCollateral', value: Decimal | null | undefined) =>
  test(field, `Collateral amount must be a non-negative number`, () => {
    if (value == null) return
    enforce(value).isNumeric().gte(0)
  })

const validateRepayBorrowedField = (userBorrowed: Decimal | null | undefined) =>
  test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
    if (userBorrowed == null) return
    enforce(userBorrowed).isNumeric().gte(0)
  })

const validateRepayHasValue = (
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
) =>
  test('root', 'Enter an amount to repay', () => {
    const total = new BigNumber(stateCollateral ?? 0).plus(userCollateral ?? 0).plus(userBorrowed ?? 0)

    enforce(total.gt(0)).isTruthy()
  })

export const collateralValidationGroup = ({ chainId, userCollateral, marketId, userAddress }: CollateralParams) =>
  group('chainValidation', () => {
    marketIdValidationSuite({ chainId, marketId })
    userAddressValidationGroup({ userAddress })
    validateUserCollateral(userCollateral)
  })

export const collateralValidationSuite = createValidationSuite((params: CollateralParams) =>
  collateralValidationGroup(params),
)

export const collateralFormValidationSuite = createValidationSuite((params: CollateralForm) => {
  validateUserCollateral(params.userCollateral)
})

export const collateralHealthValidationSuite = createValidationSuite(({ isFull, ...rest }: CollateralHealthParams) => {
  collateralValidationGroup(rest)
  validateIsFull(isFull)
})

export const repayFromCollateralValidationGroup = <IChainId extends number>({
  chainId,
  stateCollateral,
  userCollateral,
  userBorrowed,
  userAddress,
}: RepayFromCollateralParams<IChainId>) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  userAddressValidationGroup({ userAddress })
  validateRepayCollateralField('userCollateral', userCollateral)
  validateRepayCollateralField('stateCollateral', stateCollateral)
  validateRepayBorrowedField(userBorrowed)
  validateRepayHasValue(stateCollateral, userCollateral, userBorrowed)
}

export const repayFromCollateralValidationSuite = createValidationSuite((params: RepayFromCollateralParams) =>
  repayFromCollateralValidationGroup(params),
)

export const repayFormValidationSuite = createValidationSuite((params: RepayForm) => {
  validateRepayCollateralField('userCollateral', params.userCollateral)
  validateRepayCollateralField('stateCollateral', params.stateCollateral)
  validateRepayBorrowedField(params.userBorrowed)
  validateRepayHasValue(params.stateCollateral, params.userCollateral, params.userBorrowed)
})

export const repayFromCollateralIsFullValidationSuite = createValidationSuite(
  ({ isFull, ...params }: RepayFromCollateralHealthParams) => {
    repayFromCollateralValidationGroup(params)
    group('isFull', () => validateIsFull(isFull))
  },
)
