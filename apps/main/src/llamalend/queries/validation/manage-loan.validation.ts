import BigNumber from 'bignumber.js'
import { enforce, group, skipWhen, test } from 'vest'
import { getRepayImplementation } from '@/llamalend/queries/repay/repay-query.helpers'
import {
  validateIsFull,
  validateLeverageSupported,
  validateSlippage,
  validateMaxCollateral,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type {
  CollateralHealthParams,
  CollateralParams,
  RepayIsFullParams,
  RepayParams,
} from '@/llamalend/queries/validation/manage-loan.types'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup, marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { Decimal } from '@ui-kit/utils'

export type CollateralForm = FieldsOf<{ userCollateral: Decimal; maxCollateral: Decimal }>

export type RepayForm = {
  stateCollateral: Decimal | undefined
  userCollateral: Decimal | undefined
  userBorrowed: Decimal | undefined
  maxStateCollateral: Decimal | undefined
  maxCollateral: Decimal | undefined
  maxBorrowed: Decimal | undefined
  isFull: boolean | undefined
  slippage: Decimal
}

const validateRepayField = (field: 'stateCollateral' | 'userCollateral', value: Decimal | null | undefined) =>
  test(field, `Collateral amount must be a non-negative number`, () => {
    if (value == null) return
    enforce(value).isNumeric().gte(0)
  })

const validateMaxStateCollateral = (
  stateCollateral: Decimal | null | undefined,
  maxStateCollateral: Decimal | null | undefined,
) =>
  skipWhen(stateCollateral == null || maxStateCollateral == null, () => {
    test('maxStateCollateral', 'Collateral cannot exceed the amount in your wallet', () => {
      enforce(stateCollateral).lte(maxStateCollateral)
    })
  })

const validateMaxBorrowed = (userBorrowed: Decimal | null | undefined, maxBorrowed: Decimal | null | undefined) =>
  skipWhen(userBorrowed == null || maxBorrowed == null, () => {
    test('userBorrowed', 'Borrow token amount cannot exceed your wallet balance or the current debt', () => {
      enforce(userBorrowed).lte(maxBorrowed)
    })
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

const validateRepayFieldsForMarket = (
  marketId: string | null | undefined,
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
) => {
  skipWhen(!marketId, () => {
    if (!marketId) return // somehow, skipWhen doesn't stop execution of the inner function
    // Get the implementation to validate fields according to market capabilities. Default to 0 just like the queries
    getRepayImplementation(marketId, {
      stateCollateral: stateCollateral ?? '0',
      userCollateral: userCollateral ?? '0',
      userBorrowed: userBorrowed ?? '0',
    })
  })
}

export const collateralValidationGroup = ({
  chainId,
  userCollateral,
  maxCollateral,
  marketId,
  userAddress,
}: CollateralParams) =>
  group('chainValidation', () => {
    marketIdValidationSuite({ chainId, marketId })
    userAddressValidationGroup({ userAddress })
    validateUserCollateral(userCollateral)
    validateMaxCollateral(userCollateral, maxCollateral)
  })

export const collateralValidationSuite = createValidationSuite((params: CollateralParams) =>
  collateralValidationGroup(params),
)

export const addCollateralFormValidationSuite = createValidationSuite((params: CollateralForm) => {
  validateUserCollateral(params.userCollateral, false)
  validateMaxCollateral(params.userCollateral, params.maxCollateral)
})

export const removeCollateralFormValidationSuite = createValidationSuite((params: CollateralForm) => {
  validateUserCollateral(params.userCollateral, false)
  validateMaxCollateral(
    params.userCollateral,
    params.maxCollateral,
    'Collateral must be less than or equal to your position balance',
  )
})
export const collateralHealthValidationSuite = createValidationSuite(({ isFull, ...rest }: CollateralHealthParams) => {
  collateralValidationGroup(rest)
  validateIsFull(isFull)
})

export const repayValidationGroup = <IChainId extends number>(
  { chainId, marketId, stateCollateral, userCollateral, userBorrowed, userAddress, slippage }: RepayParams<IChainId>,
  { leverageRequired = false }: { leverageRequired?: boolean } = {},
) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
  userAddressValidationGroup({ userAddress })
  validateRepayField('userCollateral', userCollateral)
  validateRepayField('stateCollateral', stateCollateral)
  validateRepayBorrowedField(userBorrowed)
  validateRepayHasValue(stateCollateral, userCollateral, userBorrowed)
  validateRepayFieldsForMarket(marketId, stateCollateral, userCollateral, userBorrowed)
  validateSlippage(slippage)
  validateLeverageSupported(marketId, leverageRequired)
}

export const repayValidationSuite = ({ leverageRequired }: { leverageRequired: boolean }) =>
  createValidationSuite((params: RepayParams) => repayValidationGroup(params, { leverageRequired }))

export const repayFormValidationSuite = createValidationSuite(
  ({
    isFull,
    stateCollateral,
    maxStateCollateral,
    userCollateral,
    maxCollateral,
    userBorrowed,
    maxBorrowed,
    slippage,
  }: RepayForm) => {
    validateRepayField('userCollateral', userCollateral)
    validateRepayField('stateCollateral', stateCollateral)
    validateMaxStateCollateral(stateCollateral, maxStateCollateral)
    validateRepayBorrowedField(userBorrowed)
    validateMaxCollateral(userCollateral, maxCollateral)
    validateMaxBorrowed(userBorrowed, maxBorrowed)
    validateRepayHasValue(stateCollateral, userCollateral, userBorrowed)
    validateIsFull(isFull)
    validateSlippage(slippage)
  },
)

export const repayFromCollateralIsFullValidationSuite = createValidationSuite(
  ({ isFull, ...params }: RepayIsFullParams) => {
    repayValidationGroup(params)
    group('isFull', () => validateIsFull(isFull))
  },
)
