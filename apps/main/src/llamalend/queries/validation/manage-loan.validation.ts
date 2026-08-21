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
import { createValidationSuite } from '@evm-ui/lib'
import { validateSlippage } from '@evm-ui/lib/model'
import { chainValidationGroup } from '@evm-ui/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { marketIdValidationGroup, marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import type { UserMarketParams } from '@evm-ui/lib/model/query/root-keys'
import type { Decimal } from '@primitives/decimal.utils'

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
    evmAddressValidationGroup({ evmAddress: userAddress })
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
    evmAddressValidationGroup({ evmAddress: userAddress })
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
    evmAddressValidationGroup({ evmAddress: userAddress })
    validateSlippage({ slippage })
  },
)
