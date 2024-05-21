import type { FormStatus, FormValues } from '@/components/PageLoanCreate/types'

import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/components/PageLoanManage/utils'
import { _parseStepTokensList } from '@/utils/helpers'

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  warning: '',
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  userCollateral: '',
  userCollateralError: '',
  userBorrowed: '',
  userBorrowedError: '',
  debt: '',
  debtError: '',
  n: null,
}

export function _getStepTokensStr(formValues: FormValues, { collateral_token, borrowed_token }: OWM) {
  const { userCollateral, userBorrowed } = formValues
  let list = []

  if (+userCollateral > 0) list.push({ value: formValues.userCollateral, symbol: collateral_token.symbol })
  if (+userBorrowed > 0) list.push({ value: formValues.userBorrowed, symbol: borrowed_token.symbol })
  return _parseStepTokensList(list)
}

export function _parseValue({
  userCollateral,
  userCollateralError,
  userBorrowed,
  userBorrowedError,
  debt,
  debtError,
}: FormValues) {
  const haveUserBorrowed = +userBorrowed > 0
  const haveUserCollateral = +userCollateral > 0
  const haveDebt = +debt > 0

  return {
    swapRequired: haveUserBorrowed,
    haveUserBorrowed,
    haveUserCollateral,
    haveDebt,
    haveValues: haveUserBorrowed || haveUserCollateral,
    haveFormErrors: !!userBorrowedError || !!userCollateralError || !!debtError,
    getStepTokensStr: _getStepTokensStr,
  }
}
