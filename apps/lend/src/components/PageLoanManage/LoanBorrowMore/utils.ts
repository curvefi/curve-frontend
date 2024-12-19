import { FormStatus, FormValues } from '@/components/PageLoanManage/LoanBorrowMore/types'
import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import { _parseStepTokensList } from '@/utils/helpers'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  userCollateral: '',
  userCollateralError: '',
  userBorrowed: '',
  userBorrowedError: '',
  debt: '',
  debtError: '',
}

export function _getStepTokensStr(
  { userCollateral, userCollateralError, userBorrowed, userBorrowedError }: FormValues,
  { collateral_token, borrowed_token }: OneWayMarketTemplate,
) {
  let list = []
  const haveUserCollateral = +userCollateral > 0
  const haveUserBorrowed = +userBorrowed > 0

  if (haveUserBorrowed) list.push({ value: userBorrowed, symbol: borrowed_token.symbol })
  if (haveUserCollateral) list.push({ value: userCollateral, symbol: collateral_token.symbol })
  return _parseStepTokensList(list)
}

export function _parseValues({
  userCollateral,
  userCollateralError,
  userBorrowed,
  userBorrowedError,
  debt,
  debtError,
}: FormValues) {
  const haveUserCollateral = +userCollateral > 0
  const haveUserBorrowed = +userBorrowed > 0
  const haveDebt = +debt > 0

  return {
    swapRequired: +userCollateral > 0,
    haveUserCollateral,
    haveUserBorrowed,
    haveDebt,
    haveValues: haveUserCollateral || haveUserBorrowed,
    haveFormErrors: !!userCollateralError || !!userBorrowedError || !!debtError,
    getStepTokensStr: _getStepTokensStr,
  }
}
