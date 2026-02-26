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
  validateSlippage,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery } from '@ui-kit/lib/model'
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
  leverageEnabled: boolean
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

const validateBorrowMoreFieldsForMarket = (
  marketId: string | null | undefined,
  leverageEnabled: boolean | null | undefined,
  _userCollateral: Decimal | null | undefined,
  _userBorrowed: Decimal | null | undefined,
  _debt: Decimal | null | undefined,
  routeId: string | null | undefined,
) => {
  skipWhen(!marketId, () => {
    if (!marketId) return
    const [type] = getBorrowMoreImplementation(marketId, leverageEnabled)
    validateRoute(routeId, !!leverageEnabled && isRouterRequired(type))
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
    const debtRequired = true
    const leverageRequired = false
    validateUserCollateral(userCollateral)
    validateMaxCollateral(userCollateral, maxCollateral)
    validateUserBorrowed(userBorrowed)
    validateMaxBorrowed(userBorrowed, { label: `debt amount`, maxBorrowed })
    validateDebt(debt, debtRequired)
    validateMaxDebt(debt, maxDebt, debtRequired)
    validateSlippage(slippage)
    validateLeverageEnabled(leverageEnabled, leverageRequired)
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
  }: {
    leverageRequired?: boolean
    debtRequired?: boolean
    maxDebtRequired?: boolean
  } = {},
) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
  userAddressValidationGroup({ userAddress })
  validateUserCollateral(userCollateral)
  validateUserBorrowed(userBorrowed)
  validateDebt(debt, debtRequired)
  validateMaxDebt(debt, maxDebt, maxDebtRequired)
  validateBorrowMoreFieldsForMarket(marketId, leverageEnabled, userCollateral, userBorrowed, debt, routeId)
  validateSlippage(slippage)
  validateLeverageEnabled(leverageEnabled, leverageRequired)
  validateLeverageSupported(marketId, leverageRequired)
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
