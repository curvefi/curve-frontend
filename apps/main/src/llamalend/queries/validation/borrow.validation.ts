import { group } from 'vest'
import type { Suite } from 'vest'
import {
  validateDebt,
  validateMaxCollateral,
  validateMaxDebt,
  validateMaxDebtIsSet,
  validateRange,
  validateSlippage,
  validateUserBorrowed,
  validateUserCollateral,
} from '@/llamalend/queries/validation/borrow-fields.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { type BorrowForm, type BorrowFormQueryParams } from '../../features/borrow/types'

export const borrowFormValidationGroup = (
  { userBorrowed, userCollateral, debt, range, slippage, maxDebt, maxCollateral }: FieldsOf<BorrowForm>,
  { debtRequired = true, isMaxDebtRequired = false }: { debtRequired?: boolean; isMaxDebtRequired?: boolean } = {},
) =>
  group('borrowFormValidationGroup', () => {
    validateUserBorrowed(userBorrowed)
    validateUserCollateral(userCollateral)
    validateDebt(debt, debtRequired)
    validateSlippage(slippage)
    validateRange(range)
    validateMaxDebt(debt, maxDebt)
    validateMaxCollateral(userCollateral, maxCollateral)
    if (isMaxDebtRequired) {
      validateMaxDebtIsSet(maxDebt)
    }
  })

export const borrowFormValidationSuite = createValidationSuite(borrowFormValidationGroup)

export const borrowQueryValidationSuite = ({
  debtRequired = true,
  isMaxDebtRequired = debtRequired,
}: { debtRequired?: boolean; isMaxDebtRequired?: boolean } = {}): Suite<keyof BorrowFormQueryParams, string> =>
  createValidationSuite((params: BorrowFormQueryParams & { maxDebt?: FieldsOf<BorrowForm>['maxDebt'] }) => {
    const { chainId, leverageEnabled, marketId, userBorrowed, userCollateral, debt, range, slippage, maxDebt } = params
    marketIdValidationSuite({ chainId, marketId })
    borrowFormValidationGroup(
      { userBorrowed, userCollateral, debt, range, slippage, leverageEnabled, maxDebt },
      { debtRequired, isMaxDebtRequired },
    )
  }) as Suite<keyof BorrowFormQueryParams<IChainId>, string>
