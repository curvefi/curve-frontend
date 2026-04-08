import { skipWhen } from 'vest'
import { isRouterRequired } from '@/llamalend/llama.utils'
import { getBorrowMoreImplementation } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import {
  validateDebt,
  validateLeverageEnabled,
  validateLeverageSupported,
  validateMaxBorrowed,
  validateMaxCollateral,
  validateMaxDebt,
  validateRoute,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib'
import { type UserMarketQuery, validateSlippage } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup } from '@ui-kit/lib/model/query/market-id-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { MakeOptional } from '@ui-kit/types/util'

export type BorrowMoreMutation = {
  userCollateral: Decimal
  userBorrowed: Decimal
  debt: Decimal
  slippage: Decimal
  leverageEnabled: boolean | undefined // undefined until we know if the position is leveraged
  routeId: string | undefined
}

type CalculatedValues = {
  maxDebt: Decimal | undefined
  maxCollateral: Decimal | undefined
  maxBorrowed: Decimal | undefined
}

export type BorrowMoreForm = MakeOptional<BorrowMoreMutation, 'userCollateral' | 'userBorrowed' | 'debt'> &
  CalculatedValues

export type BorrowMoreQuery<ChainId = number> = UserMarketQuery<ChainId> &
  BorrowMoreMutation &
  Pick<CalculatedValues, 'maxDebt'>
export type BorrowMoreParams<ChainId = number> = FieldsOf<BorrowMoreQuery<ChainId>>

const validateBorrowMoreFieldsForMarket = ({
  marketId,
  leverageEnabled,
  routeId,
  debt,
}: {
  marketId: string | null | undefined
  leverageEnabled: boolean | null | undefined
  routeId: string | null | undefined
  debt: Decimal | null | undefined
}) => {
  skipWhen(!marketId, () => {
    if (!marketId) return
    const [type] = getBorrowMoreImplementation(marketId, leverageEnabled)
    validateRoute(routeId, !!(debt && leverageEnabled && isRouterRequired(type)))
  })
}

// Form validation suite (for real-time form validation)
export const borrowMoreFormValidationSuite = createValidationSuite(
  ({
    userCollateral = '0',
    userBorrowed = '0',
    debt,
    maxBorrowed,
    maxCollateral,
    maxDebt,
    slippage,
    leverageEnabled,
  }: BorrowMoreForm) => {
    validateUserCollateral(userCollateral, { required: false })
    validateMaxCollateral(userCollateral, maxCollateral, { required: false })
    validateUserBorrowed(userBorrowed)
    validateMaxBorrowed(userBorrowed, { label: `debt amount`, maxBorrowed, required: true })
    validateDebt(debt, { required: true })
    validateMaxDebt(debt, maxDebt, { required: true })
    validateSlippage({ slippage })
    validateLeverageEnabled(leverageEnabled, { required: false })
  },
)

// Query validation suite (for API queries)
export const borrowMoreValidationGroup = <IChainId extends number>(
  {
    chainId,
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    debt,
    maxDebt,
    userAddress,
    slippage,
    leverageEnabled,
    routeId,
  }: BorrowMoreParams<IChainId>,
  {
    leverageRequired = false,
    debtRequired = false,
    maxDebtRequired = debtRequired,
    ignoreMaxDebt = !maxDebtRequired,
  }: {
    leverageRequired?: boolean
    debtRequired?: boolean
    maxDebtRequired?: boolean
    ignoreMaxDebt?: boolean
  } = {},
) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
  userAddressValidationGroup({ userAddress })
  validateUserCollateral(userCollateral, { required: false })
  validateUserBorrowed(userBorrowed)
  validateDebt(debt, { required: debtRequired })
  if (!ignoreMaxDebt) validateMaxDebt(debt, maxDebt, { required: maxDebtRequired })
  validateBorrowMoreFieldsForMarket({ marketId, leverageEnabled, routeId, debt })
  validateSlippage({ slippage })
  validateLeverageEnabled(leverageEnabled, { required: leverageRequired })
  validateLeverageSupported(marketId, { required: leverageRequired })
}

export const borrowMoreValidationSuite = ({
  leverageRequired,
  debtRequired = false,
  maxDebtRequired = debtRequired,
}: {
  leverageRequired: boolean
  debtRequired?: boolean
  maxDebtRequired?: boolean
}) =>
  createValidationSuite((params: BorrowMoreParams) =>
    borrowMoreValidationGroup(params, { leverageRequired, debtRequired, maxDebtRequired }),
  )

export const borrowMoreMutationValidationSuite = createValidationSuite((params: BorrowMoreParams) => {
  borrowMoreValidationGroup(params, { debtRequired: true, maxDebtRequired: true })
  validateDebt(params.debt)
})

export const borrowMoreLeverageValidationSuite = createValidationSuite((params: BorrowMoreParams) =>
  borrowMoreValidationGroup(params, { leverageRequired: true, debtRequired: true, maxDebtRequired: false }),
)
