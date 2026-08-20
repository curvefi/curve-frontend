import { enforce, skipWhen, test } from 'vest'
import { isRouterRequired, tryGetMarket } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { getRepayImplementationType } from '@/llamalend/queries/repay/repay-query.helpers'
import {
  validateIsFull,
  validateLeverageSupported,
  validateLeverageValuesSupported,
  validateMaxBorrowed,
  validateMaxCollateral,
  validateMaxStateCollateral,
  validateRoute,
  validateRouteCalldata,
  validateRouteProvider,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type { RepayFormData, RepayParams } from '@/llamalend/queries/validation/repay.types'
import type { Decimal } from '@primitives/decimal.utils'
import type { RouteProvider } from '@primitives/router.utils'
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
  marketId: MarketTemplate | string | null | undefined,
  stateCollateral: Decimal | null | undefined,
  userCollateral: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
  routeId: string | null | undefined,
  leverageProviders: readonly RouteProvider[] | undefined,
  validateLeverageProviders: boolean,
) => {
  const market = tryGetMarket(marketId)
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
    validateRouteCalldata(routeId)
    if (validateLeverageProviders) validateRouteProvider(routeId, leverageProviders, type === 'zapV2')

    skipWhen(!['deleverage', 'zapV2', null, undefined].includes(type), () => {
      test('userBorrowed', `Borrow amount is not supported for repay ${type}`, () => {
        enforce(+(userBorrowed ?? '0')).equals(0)
      })
    })
  })
}

const repayValidationGroup = (
  marketId: MarketTemplate | string | null | undefined,
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
    leverageProviders,
    validateLeverageProviders = false,
  }: {
    leverageRequired: boolean
    validateMax: boolean
    maxRequired?: boolean
    leverageProviders?: readonly RouteProvider[]
    validateLeverageProviders?: boolean
  },
) => {
  const market = tryGetMarket(marketId)
  validateRepayCollateralField('userCollateral', userCollateral)
  validateRepayCollateralField('stateCollateral', stateCollateral)
  validateRepayBorrowedField(userBorrowed)
  validateRepayHasValue(stateCollateral, userCollateral, userBorrowed)
  validateRepayFieldsForMarket(
    market,
    stateCollateral,
    userCollateral,
    userBorrowed,
    routeId,
    leverageProviders,
    validateLeverageProviders,
  )
  validateSlippage({ slippage })
  validateLeverageSupported(market, { required: leverageRequired })
  validateIsFull(isFull)

  skipWhen(!validateMax, () => {
    validateMaxBorrowed(userBorrowed, { label: `repay amount`, maxBorrowed, required: maxRequired })
    validateMaxCollateral(userCollateral, maxCollateral, { required: maxRequired })
    validateMaxStateCollateral(stateCollateral, maxStateCollateral, { required: maxRequired })
  })
}

export const repayValidationSuite = (options: {
  leverageRequired: boolean
  validateMax: boolean
  requireLeverageValue?: boolean
  leverageProviders?: readonly RouteProvider[]
}) => {
  const { leverageRequired, validateMax, requireLeverageValue = leverageRequired, leverageProviders } = options
  return createValidationSuite(({ chainId, marketId, userAddress, ...params }: RepayParams) => {
    const market = tryGetMarket(marketId)
    userMarketValidationSuite({ chainId, marketId, userAddress })
    repayValidationGroup(market, params, {
      leverageRequired,
      validateMax,
      leverageProviders,
      validateLeverageProviders: 'leverageProviders' in options, // If omitted skips provider validation for queries
    })
    validateLeverageValuesSupported(market, requireLeverageValue)
  })
}

export const repayFormValidationSuite = (market: MarketTemplate | undefined) =>
  createValidationSuite((params: RepayFormData) =>
    repayValidationGroup(market, params, { validateMax: true, leverageRequired: false }),
  )
