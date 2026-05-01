import { group } from 'vest'
import {
  validateIsFull,
  validateLeverageValuesSupported,
  validateMaxCollateral,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type {
  CloseLoanParams,
  CollateralHealthParams,
  CollateralParams,
} from '@/llamalend/queries/validation/manage-loan.types'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite } from '@ui-kit/lib'
import { validateSlippage } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup, marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { UserMarketParams } from '@ui-kit/lib/model/query/root-keys'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'

export type CollateralForm = {
  userCollateral: Decimal | undefined
  maxCollateral: Decimal | undefined
}

const collateralValidationGroup = ({
  chainId,
  userCollateral,
  maxCollateral,
  marketId,
  userAddress,
}: CollateralParams) =>
  group('chainValidation', () => {
    marketIdValidationSuite({ chainId, marketId })
    userAddressValidationGroup({ userAddress })
    validateUserCollateral(userCollateral, { required: true })
    validateMaxCollateral(userCollateral, maxCollateral, { required: true })
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
  validateUserCollateral(params.userCollateral, { required: true })
  validateMaxCollateral(params.userCollateral, params.maxCollateral, { required: true })
})

export const removeCollateralFormValidationSuite = createValidationSuite((params: CollateralForm) => {
  validateUserCollateral(params.userCollateral, { required: true })
  validateMaxCollateral(params.userCollateral, params.maxCollateral, { required: true })
})
export const collateralHealthValidationSuite = createValidationSuite(({ isFull, ...rest }: CollateralHealthParams) => {
  collateralValidationGroup(rest)
  validateIsFull(isFull)
})

export const closeLoanValidationSuite = createValidationSuite(
  ({ chainId, marketId, userAddress, slippage }: CloseLoanParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    marketIdValidationGroup({ marketId })
    userAddressValidationGroup({ userAddress })
    validateSlippage({ slippage })
  },
)
