import { enforce, group, skipWhen, test } from 'vest'
import { getRepayImplementation } from '@/llamalend/queries/repay/repay-query.helpers'
import {
  validateIsFull,
  validateLeverageSupported,
  validateLeverageValuesSupported,
  validateMaxBorrowed,
  validateMaxCollateral,
  validateSlippage,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type {
  CloseLoanParams,
  CollateralHealthParams,
  CollateralParams,
  RepayIsFullParams,
  RepayParams,
} from '@/llamalend/queries/validation/manage-loan.types'
import { createValidationSuite } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup, marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { UserMarketParams } from '@ui-kit/lib/model/query/root-keys'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { Decimal } from '@ui-kit/utils'

export type CollateralForm = {
  userCollateral: Decimal | undefined
  maxCollateral: Decimal | undefined
}

export type RepayForm = CollateralForm & {
  stateCollateral: Decimal | undefined
  userBorrowed: Decimal | undefined
  maxStateCollateral: Decimal | undefined
  maxBorrowed: Decimal | undefined
  isFull: boolean
  slippage: Decimal
}

export const validateRepayCollateralField = (
  field: 'stateCollateral' | 'userCollateral',
  value: Decimal | null | undefined,
): void => {
  test(field, `Collateral amount must be a non-negative number`, () => {
    if (value == null) return
    enforce(value).isNumeric().gte(0)
  })
}

const validateMaxStateCollateral = (
  stateCollateral: Decimal | null | undefined,
  maxStateCollateral: Decimal | null | undefined,
) =>
  skipWhen(stateCollateral == null || maxStateCollateral == null, () => {
    test('maxStateCollateral', 'Collateral cannot exceed the amount in your wallet', () => {
      enforce(stateCollateral).lte(maxStateCollateral)
    })
  })

export const validateRepayBorrowedField = (userBorrowed: Decimal | null | undefined): void => {
  skipWhen(userBorrowed == null, () =>
    test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
      enforce(userBorrowed).isNumeric().gte(0)
    }),
  )
}

const validateRepayHasValue = (
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
) =>
  test(
    stateCollateral ? 'stateCollateral' : userCollateral ? 'userCollateral' : 'userBorrowed',
    'Enter an amount to repay',
    () => {
      enforce(stateCollateral ?? userCollateral ?? userBorrowed)
        .isNumeric()
        .greaterThan(0)
    },
  )

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

export const leverageCollateralValidationSuite = createValidationSuite((params: CollateralParams) => {
  collateralValidationGroup(params)
  validateLeverageValuesSupported(params.marketId)
})

export const leverageUserMarketValidationSuite = createValidationSuite(
  ({ chainId, marketId, userAddress }: UserMarketParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    marketIdValidationGroup({ marketId })
    userAddressValidationGroup({ userAddress })
    validateLeverageValuesSupported(marketId)
  },
)

export const addCollateralFormValidationSuite = createValidationSuite((params: CollateralForm) => {
  validateUserCollateral(params.userCollateral)
  validateMaxCollateral(params.userCollateral, params.maxCollateral)
})

export const removeCollateralFormValidationSuite = createValidationSuite((params: CollateralForm) => {
  validateUserCollateral(params.userCollateral)
  validateMaxCollateral(params.userCollateral, params.maxCollateral)
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
  validateRepayCollateralField('userCollateral', userCollateral)
  validateRepayCollateralField('stateCollateral', stateCollateral)
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
    stateCollateral,
    userCollateral,
    userBorrowed,
    maxStateCollateral,
    maxBorrowed,
    maxCollateral,
    isFull,
    slippage,
  }: RepayForm) => {
    validateRepayCollateralField('userCollateral', userCollateral)
    validateRepayCollateralField('stateCollateral', stateCollateral)
    validateMaxStateCollateral(stateCollateral, maxStateCollateral)
    validateRepayBorrowedField(userBorrowed)
    validateMaxBorrowed(userBorrowed, { label: `repay amount`, maxBorrowed })
    validateMaxCollateral(userCollateral, maxCollateral)
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

export const closeLoanValidationSuite = createValidationSuite(
  ({ chainId, marketId, userAddress, slippage }: CloseLoanParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    marketIdValidationGroup({ marketId })
    userAddressValidationGroup({ userAddress })
    validateSlippage(slippage)
  },
)
