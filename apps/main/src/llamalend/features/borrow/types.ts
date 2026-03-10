import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import type { FieldsOf } from '@ui-kit/lib'
import type { MarketQuery } from '@ui-kit/lib/model'
import type { MakeOptional } from '@ui-kit/types/util'

/** Complete create loan form with all fields already filled in (after validation) */
type CompleteCreateLoanForm = {
  userCollateral: Decimal
  userBorrowed: Decimal // currently hidden and always 0, this can be used to leverage by depositing debt token
  debt: Decimal
  range: number
  slippage: Decimal
  leverageEnabled: boolean
  routeId: string | undefined
}

// todo: get rid of this, it's incorrect. We only did it because it was easier to run the validation suite
type CalculatedValues = { maxDebt: Decimal | undefined; maxCollateral: Decimal | undefined }

/** Create loan form as used in the UI, with some fields still optional or being filled in */
export type CreateLoanForm = MakeOptional<CompleteCreateLoanForm, 'debt' | 'userCollateral'> & CalculatedValues

/** Full query type for create loan queries, including pool identification and all form fields */
export type CreateLoanFormQuery<T = IChainId> = MarketQuery<T> & CompleteCreateLoanForm

/** Fields of the create loan form query before validation */
export type CreateLoanFormQueryParams<T = IChainId> = FieldsOf<CreateLoanFormQuery<T>>

/** Create loan form query including max debt field */
export type CreateLoanDebtQuery<T = IChainId> = CreateLoanFormQuery<T> & Pick<CreateLoanForm, 'maxDebt'>
/** Fields of the create loan debt query before validation */
export type CreateLoanDebtParams<T = IChainId> = FieldsOf<CreateLoanDebtQuery<T>>
