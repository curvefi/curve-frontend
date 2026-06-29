import { enforce, skipWhen, test } from 'vest'
import { isRouterRequired, tryGetLlamaMarket } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { getRepayImplementationType } from '@/llamalend/queries/repay/repay-query.helpers'
import {
  validateIsFull,
  validateLeverageSupported,
  validateLeverageValuesSupported,
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

const validateRepayBorrowedField = (debt: Decimal | null | undefined): void => {
  skipWhen(debt == null, () =>
    test('debt', 'Borrow amount must be a non-negative number', () => {
      enforce(debt).isDecimal().gte(0)
    }),
  )
}

const validateRepayHasValue = (
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  debt: Decimal | null | undefined,
) => {
  test('root', 'Enter an amount to repay', () => {
    enforce(stateCollateral ?? userCollateral ?? debt)
      .isDecimal()
      .greaterThan(0)
  })
}

const validateRepayFieldsForMarket = (
  marketId: LlamaMarketTemplate | string | null | undefined,
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  debt: Decimal | null | undefined,
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
        debt: debt ?? '0',
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
    debt,
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
  const market = tryGetLlamaMarket(marketId)
  validateRepayCollateralField('userCollateral', userCollateral)
  validateRepayCollateralField('stateCollateral', stateCollateral)
  validateRepayBorrowedField(debt)
  validateRepayHasValue(stateCollateral, userCollateral, debt)
  validateRepayFieldsForMarket(market, stateCollateral, userCollateral, debt, routeId)
  validateSlippage({ slippage })
  validateLeverageSupported(market, { required: leverageRequired })
  validateIsFull(isFull)

  skipWhen(!validateMax, () => {
    validateMaxBorrowed(debt, { label: `repay amount`, maxBorrowed, required: maxRequired })
    validateMaxCollateral(userCollateral, maxCollateral, { required: maxRequired })
    validateMaxStateCollateral(stateCollateral, maxStateCollateral, { required: maxRequired })
  })
}

export const repayValidationSuite = ({
  leverageRequired,
  validateMax,
  requireLeverageValue = leverageRequired,
}: {
  leverageRequired: boolean
  validateMax: boolean
  requireLeverageValue?: boolean
}) =>
  createValidationSuite(({ chainId, marketId, userAddress, ...params }: RepayParams) => {
    const market = tryGetLlamaMarket(marketId)
    userMarketValidationSuite({ chainId, marketId, userAddress })
    repayValidationGroup(market, params, { leverageRequired, validateMax })
    validateLeverageValuesSupported(market, requireLeverageValue)
  })

export const repayFormValidationSuite = (market: LlamaMarketTemplate | undefined) =>
  createValidationSuite((params: RepayFormData) =>
    repayValidationGroup(market, params, { validateMax: true, leverageRequired: false }),
  )
