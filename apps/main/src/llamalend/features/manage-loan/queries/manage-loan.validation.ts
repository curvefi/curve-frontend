import { group } from 'vest'
import type {
  CollateralHealthParams,
  CollateralParams,
  RepayFromCollateralHealthParams,
  RepayFromCollateralParams,
} from '@/llamalend/features/manage-loan/queries/manage-loan.types'
import {
  validateIsFull,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import { createValidationSuite } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup } from '@ui-kit/lib/model/query/market-id-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'

export const collateralValidationGroup = ({ chainId, userCollateral, marketId, userAddress }: CollateralParams) =>
  group('chainValidation', () => {
    marketIdValidationGroup({ marketId, chainId })
    userAddressValidationGroup({ userAddress })
    validateUserCollateral(userCollateral)
  })

export const collateralValidationSuite = createValidationSuite((params: CollateralParams) =>
  collateralValidationGroup(params),
)

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

export const repayFromCollateralIsFullValidationSuite = createValidationSuite(
  ({ isFull, ...params }: RepayFromCollateralHealthParams) => {
    repayFromCollateralValidationGroup(params)
    group('isFull', () => validateIsFull(isFull))
  },
)
