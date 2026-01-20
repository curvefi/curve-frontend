import type { FormStatus, FormValues } from '@/lend/components/PageLendMarket/LoanRepay/types'
import { DEFAULT_FORM_STATUS as FORM_STATUS } from '@/lend/components/PageLendMarket/utils'
import { type OneWayMarketTemplate } from '@/lend/types/lend.types'

export const DEFAULT_FORM_STATUS: FormStatus = {
  ...FORM_STATUS,
  warning: '',
  step: '',
}

export const DEFAULT_FORM_VALUES: FormValues = {
  userBorrowed: '',
  userBorrowedError: '',
  userCollateral: '',
  userCollateralError: '',
  stateCollateral: '',
  stateCollateralError: '',
  isFullRepay: false,
}

export function _getIsSwapRequire({ stateCollateral, userCollateral }: FormValues) {
  const haveStateCollateral = +stateCollateral > 0
  const haveUserCollateral = +userCollateral > 0
  return haveStateCollateral || haveUserCollateral
}

export function _getStepTokensStr(formValues: FormValues, { collateral_token, borrowed_token }: OneWayMarketTemplate) {
  const { userCollateral, stateCollateral, userBorrowed } = formValues
  const collateralTotal = +userCollateral + +stateCollateral

  const list = []
  const symbolList = []
  if (+collateralTotal > 0) symbolList.push({ value: collateralTotal, symbol: collateral_token.symbol })
  if (+stateCollateral > 0) list.push({ value: stateCollateral, symbol: `${collateral_token.symbol} from collateral` })
  if (+userCollateral > 0) list.push({ value: userCollateral, symbol: `${collateral_token.symbol}` })
  if (+userBorrowed > 0) {
    list.push({ value: userBorrowed, symbol: borrowed_token.symbol })
    symbolList.push({ value: userBorrowed, symbol: borrowed_token.symbol })
  }

  return {
    symbolList: symbolList.map(({ symbol }) => symbol).join(', '),
    symbolAndAmountList: list.map(({ value, symbol }) => `${value} ${symbol}`).join(', '),
  }
}

export function _parseValues(formValues: FormValues) {
  const {
    isFullRepay,
    stateCollateral,
    stateCollateralError,
    userBorrowed,
    userBorrowedError,
    userCollateral,
    userCollateralError,
  } = formValues

  const swapRequired = _getIsSwapRequire(formValues)
  const haveStateCollateral = +stateCollateral > 0
  const haveUserBorrowed = +userBorrowed > 0
  const haveUserCollateral = +userCollateral > 0

  return {
    swapRequired,
    haveStateCollateral,
    haveUserBorrowed,
    haveUserCollateral,
    haveValues: swapRequired
      ? haveStateCollateral || haveUserBorrowed || haveUserCollateral
      : haveUserBorrowed || isFullRepay,
    haveFormErrors: !!stateCollateralError || !!userBorrowedError || !!userCollateralError,
    getStepTokensStr: _getStepTokensStr,
  }
}
