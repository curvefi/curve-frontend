import type { FormStatus, FormValues } from '@/lend/components/PageLoanCreate/types'
import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/lend/components/PageLoanManage/utils'
import { type OneWayMarketTemplate } from '@/lend/types/lend.types'
import { _parseStepTokensList } from '@/lend/utils/helpers'

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

export function _getStepTokensStr(formValues: FormValues, { collateral_token, borrowed_token }: OneWayMarketTemplate) {
  const { userCollateral, userBorrowed } = formValues
  const list = []

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
