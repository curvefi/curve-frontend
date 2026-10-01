import { group, skipWhen, test } from 'vest'
import { isRouterRequired, tryGetMarket } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import {
  validateDebt,
  validateControllerApproval,
  validateLeverageEnabled,
  validateMaxCollateral,
  validateMaxDebt,
  validateRange,
  validateRoute,
  validateRouteCalldata,
  validateRouteProvider,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import { marketIdValidationSuite } from '@evm-ui/queries/validation/market-id-validation'
import type { RouteProvider } from '@primitives/router.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { validateSlippage } from '@ui/lib/validation/slippage.validation'
import { type FieldsOf } from '@ui/lib/validation/types'
import { type CreateLoanDebtParams, type CreateLoanForm } from '../../features/borrow/types'
import { getCreateLoanImplementation } from '../create-loan/create-loan-query.helpers'

const createLoanFormValidationGroup = (
  {
    userBorrowed,
    userCollateral,
    debt,
    range,
    slippage,
    maxDebt,
    maxCollateral,
    leverageEnabled,
    routeId,
    isControllerApproved,
  }: FieldsOf<CreateLoanForm & { isControllerApproved: boolean }>,
  {
    debtRequired,
    isMaxDebtRequired,
    isLeverageRequired,
    collateralRequired,
    ignoreMaxCollateral,
    market,
    requireControllerApproval,
  }: {
    debtRequired: boolean
    isMaxDebtRequired: boolean
    isLeverageRequired: boolean
    collateralRequired: boolean
    ignoreMaxCollateral: boolean
    market: MarketTemplate | undefined
    requireControllerApproval: boolean
  },
) =>
  group('createLoanFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    validateUserCollateral(userCollateral, { required: collateralRequired })
    validateDebt(debt, { required: debtRequired })
    validateSlippage({ slippage })
    validateRange(range)
    validateMaxDebt(debt, maxDebt, { required: isMaxDebtRequired })
    if (!ignoreMaxCollateral) validateMaxCollateral(userCollateral, maxCollateral, { required: collateralRequired })
    validateLeverageEnabled(leverageEnabled, { required: isLeverageRequired })
    validateRouteCalldata(routeId, market)
    validateControllerApproval(isControllerApproved, { required: requireControllerApproval })
  })

function validateCreateLoanFieldsForMarket(
  params: FieldsOf<CreateLoanForm & { marketId: string }>,
  {
    debtRequired,
    leverageProviders,
    validateLeverageProviders,
  }: {
    debtRequired: boolean
    leverageProviders: readonly RouteProvider[] | undefined
    validateLeverageProviders: boolean
  },
) {
  const { marketId, leverageEnabled, routeId, userBorrowed } = params
  const market = tryGetMarket(marketId)
  skipWhen(!market, () => {
    const [type] = market ? getCreateLoanImplementation(market, !!leverageEnabled) : []
    // if we don't need debt we cannot need a route, as we need a route to calculate max debt
    validateRoute(routeId, !!(type && debtRequired && leverageEnabled && isRouterRequired(type)))
    if (validateLeverageProviders) validateRouteProvider(routeId, leverageProviders, type === 'zapV2')
    skipWhen(type == null, () => {
      test('userBorrowed', `Borrow amount is not supported for creating loan ${type}`, () => {
        enforce(+(userBorrowed ?? '0')).equals(0)
      })
    })
  })
}

export const createLoanFormValidationSuite = (marketId: string | undefined) =>
  createValidationSuite((params: CreateLoanForm) => {
    createLoanFormValidationGroup(params, {
      debtRequired: true,
      isMaxDebtRequired: true,
      isLeverageRequired: false,
      collateralRequired: true,
      ignoreMaxCollateral: false,
      market: tryGetMarket(marketId) ?? undefined,
      requireControllerApproval: false,
    })
    validateCreateLoanFieldsForMarket(
      { ...params, marketId },
      { debtRequired: true, leverageProviders: undefined, validateLeverageProviders: false },
    )
  })

export const createLoanQueryValidationSuite = (options: {
  debtRequired: boolean
  ignoreMaxCollateral?: boolean
  collateralRequired?: boolean
  isMaxDebtRequired?: boolean
  isLeverageRequired?: boolean
  leverageProviders?: readonly RouteProvider[]
  requireControllerApproval?: boolean
}) => {
  const {
    debtRequired,
    isMaxDebtRequired = debtRequired,
    collateralRequired = false,
    ignoreMaxCollateral = !collateralRequired,
    isLeverageRequired = false,
    leverageProviders,
    requireControllerApproval = false,
  } = options
  return createValidationSuite((params: CreateLoanDebtParams & { isControllerApproved?: boolean }) => {
    marketIdValidationSuite.run(params)
    createLoanFormValidationGroup(params, {
      debtRequired,
      isMaxDebtRequired,
      isLeverageRequired,
      collateralRequired,
      ignoreMaxCollateral,
      market: tryGetMarket(params.marketId) ?? undefined,
      requireControllerApproval,
    })
    validateCreateLoanFieldsForMarket(params, {
      debtRequired,
      leverageProviders,
      validateLeverageProviders: 'leverageProviders' in options, // If omitted skips provider validation for queries
    })
  })
}
