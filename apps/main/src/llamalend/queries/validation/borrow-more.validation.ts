import { skipWhen } from 'vest'
import type { Address } from 'viem'
import { getBorrowMoreImplementationArgs } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import {
  validateDebt,
  validateLeverageSupported,
  validateMaxCollateral,
  validateMaxDebt,
  validateSlippage,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup } from '@ui-kit/lib/model/query/market-id-validation'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import { Decimal } from '@ui-kit/utils'

// Types
export type BorrowMoreForm = {
  userCollateral: Decimal | undefined
  userBorrowed: Decimal | undefined
  debt: Decimal | undefined
  maxCollateral: Decimal | undefined
  maxBorrowed: Decimal | undefined
  maxDebt: Decimal | undefined
  slippage: Decimal
}

export type BorrowMoreQuery<ChainId = number> = {
  chainId: ChainId
  marketId: string
  userAddress: Address
  userCollateral: Decimal
  userBorrowed: Decimal
  debt: Decimal
  slippage: Decimal
}

export type BorrowMoreParams<ChainId = number> = FieldsOf<BorrowMoreQuery<ChainId>>

const validateBorrowMoreFieldsForMarket = (
  marketId: string | null | undefined,
  userCollateral: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
  debt: Decimal | null | undefined,
) => {
  skipWhen(!marketId, () => {
    if (!marketId) return
    getBorrowMoreImplementationArgs(marketId, {
      debt: debt ?? '0',
      userCollateral: userCollateral ?? '0',
      userBorrowed: userBorrowed ?? '0',
    })
  })
}

// Form validation suite (for real-time form validation)
export const borrowMoreFormValidationSuite = createValidationSuite(
  (
    { userCollateral = '0', userBorrowed = '0', debt, maxCollateral, maxDebt, slippage }: BorrowMoreForm,
    { maxDebtRequired = true }: { maxDebtRequired?: boolean } = {},
  ) => {
    validateUserCollateral(userCollateral)
    validateMaxCollateral(userCollateral, maxCollateral)
    validateUserBorrowed(userBorrowed, { allowZero: true })
    validateDebt(debt)
    validateMaxDebt(debt, maxDebt, maxDebtRequired)
    validateSlippage(slippage)
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
    userAddress,
    slippage,
  }: BorrowMoreParams<IChainId>,
  { leverageRequired = false, debtRequired = false }: { leverageRequired?: boolean; debtRequired?: boolean } = {},
) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
  userAddressValidationGroup({ userAddress })
  validateUserCollateral(userCollateral)
  validateUserBorrowed(userBorrowed, { allowZero: true })
  validateDebt(debt, debtRequired)
  validateBorrowMoreFieldsForMarket(marketId, userCollateral, userBorrowed, debt)
  validateSlippage(slippage)
  validateLeverageSupported(marketId, leverageRequired)
}

export const borrowMoreValidationSuite = ({ leverageRequired }: { leverageRequired: boolean }) =>
  createValidationSuite((params: BorrowMoreParams) => borrowMoreValidationGroup(params, { leverageRequired }))

export const borrowMoreMutationValidationSuite = createValidationSuite((params: BorrowMoreParams) => {
  borrowMoreValidationGroup(params)
  validateDebt(params.debt)
})

export const borrowMoreLeverageValidationSuite = createValidationSuite((params: BorrowMoreParams) =>
  borrowMoreValidationGroup(params, { leverageRequired: true }),
)
