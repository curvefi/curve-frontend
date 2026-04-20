import { enforce, skipWhen, test } from 'vest'
import { isRouterRequired, tryGetLlamaMarket } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { getRepayImplementationType } from '@/llamalend/queries/repay/repay-query.helpers'
import {
  validateIsFull,
  validateLeverageSupported,
  validateMaxBorrowed,
  validateMaxCollateral,
  validateMaxStateCollateral,
  validateRoute,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type { RepayFormData, RepayParams } from '@/llamalend/queries/validation/repay.types'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { validateSlippage } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

const validateRepayCollateralField = (
  field: 'stateCollateral' | 'userCollateral',
  value: Decimal | null | undefined,
): void => {
  skipWhen(value == null, () => {
    test(field, `Collateral amount must be a non-negative number`, () => {
      enforce(value).isDecimal().gte(0)
    })
  })
}

const validateRepayBorrowedField = (userBorrowed: Decimal | null | undefined): void => {
  skipWhen(userBorrowed == null, () =>
    test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
      enforce(userBorrowed).isDecimal().gte(0)
    }),
  )
}

const validateRepayHasValue = (
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
) => {
  test('root', 'Enter an amount to repay', () => {
    enforce(stateCollateral ?? userCollateral ?? userBorrowed)
      .isDecimal()
      .greaterThan(0)
  })
}

const validateRepayFieldsForMarket = (
  marketId: LlamaMarketTemplate | string | null | undefined,
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
  routeId: string | null | undefined,
) => {
  const market = tryGetLlamaMarket(marketId)
  skipWhen(!market, () => {
    // Get the implementation to validate fields according to market capabilities. Default to 0 just like the queries
    const type =
      market &&
      getRepayImplementationType(market, {
        stateCollateral: stateCollateral ?? '0',
        userCollateral: userCollateral ?? '0',
        userBorrowed: userBorrowed ?? '0',
      })
    const swapRequired = stateCollateral || userCollateral || routeId
    validateRoute(routeId, !!(type && swapRequired && isRouterRequired(type)))
  })
}

const repayValidationGroup = (
  marketId: LlamaMarketTemplate | string | null | undefined,
  {
    stateCollateral,
    userCollateral,
    userBorrowed,
    slippage,
    routeId,
    isFull,
    maxStateCollateral,
    maxCollateral,
    maxBorrowed,
  }: FieldsOf<RepayFormData>,
  {
    leverageRequired,
    validateMax,
    maxRequired = validateMax,
  }: { leverageRequired: boolean; validateMax: boolean; maxRequired?: boolean },
) => {
  validateRepayCollateralField('userCollateral', userCollateral)
  validateRepayCollateralField('stateCollateral', stateCollateral)
  validateRepayBorrowedField(userBorrowed)
  validateRepayHasValue(stateCollateral, userCollateral, userBorrowed)
  validateRepayFieldsForMarket(marketId, stateCollateral, userCollateral, userBorrowed, routeId)
  validateSlippage({ slippage })
  validateLeverageSupported(marketId, { required: leverageRequired })
  validateIsFull(isFull)

  skipWhen(!validateMax, () => {
    validateMaxBorrowed(userBorrowed, { label: `repay amount`, maxBorrowed, required: maxRequired })
    validateMaxCollateral(userCollateral, maxCollateral, { required: maxRequired })
    validateMaxStateCollateral(stateCollateral, maxStateCollateral, { required: maxRequired })
  })
}

export const repayValidationSuite = ({
  leverageRequired,
  validateMax,
}: {
  leverageRequired: boolean
  validateMax: boolean
}) =>
  createValidationSuite(({ chainId, marketId, userAddress, ...params }: RepayParams) => {
    userMarketValidationSuite({ chainId, marketId, userAddress })
    repayValidationGroup(marketId, params, { leverageRequired, validateMax })
  })

export const repayFormValidationSuite = (market: LlamaMarketTemplate | undefined) =>
  createValidationSuite((params: RepayFormData) =>
    repayValidationGroup(market, params, { validateMax: true, leverageRequired: false }),
  )
