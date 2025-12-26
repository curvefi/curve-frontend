import { group } from 'vest'
import {
  validateIsFull,
  validateMaxCollateral,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type {
  CollateralHealthParams,
  CollateralParams,
  RepayFromCollateralIsFullParams,
  RepayFromCollateralParams,
} from '@/llamalend/queries/validation/manage-loan.types'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { Decimal } from '@ui-kit/utils'

export type CollateralForm = FieldsOf<{ userCollateral: Decimal; maxCollateral: Decimal }>

export type RepayForm = FieldsOf<{
  stateCollateral: Decimal
  userCollateral: Decimal
  userBorrowed: Decimal
  isFull: boolean
}>

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
  validateUserCollateral(userCollateral)
  validateUserCollateral(stateCollateral)
  validateUserBorrowed(userBorrowed)
}

export const repayFromCollateralValidationSuite = createValidationSuite((params: RepayFromCollateralParams) =>
  repayFromCollateralValidationGroup(params),
)

export const repayFormValidationSuite = createValidationSuite((params: RepayForm) => {
  validateUserCollateral(params.userCollateral)
  validateUserCollateral(params.stateCollateral)
  validateUserBorrowed(params.userBorrowed)
  validateIsFull(params.isFull)
})

export const repayFromCollateralIsFullValidationSuite = createValidationSuite(
  ({ isFull, ...params }: RepayFromCollateralIsFullParams) => {
    repayFromCollateralValidationGroup(params)
    group('isFull', () => validateIsFull(isFull))
  },
)
