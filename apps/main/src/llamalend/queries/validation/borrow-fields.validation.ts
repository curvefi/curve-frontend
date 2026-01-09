import { enforce, test, skipWhen } from 'vest'
import { PRESET_RANGES } from '@/llamalend/constants'
import { Decimal } from '@ui-kit/utils'

export const validateUserBorrowed = (userBorrowed: Decimal | null | undefined) => {
  test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
    enforce(userBorrowed).isNumeric().gte(0)
  })
}

export const validateUserCollateral = (userCollateral: Decimal | undefined | null, required: boolean = true) => {
  test('userCollateral', `Collateral amount must be a positive number`, () => {
    if (required || userCollateral != null) {
      enforce(userCollateral).isNumeric().gt(0)
    }
  })
}

export const validateDebt = (debt: Decimal | undefined | null, required: boolean = true) => {
  skipWhen(!required && !debt, () => {
    test('debt', `Debt must be a positive number${required ? '' : ' or null'}`, () => {
      enforce(debt).isNumeric().gt(0)
    })
  })
}

export const validateSlippage = (slippage: Decimal | null | undefined) => {
  test('slippage', 'Slippage must be a number between 0 and 100', () => {
    enforce(slippage).isNumeric().gte(0).lte(100)
  })
}

export const validateRange = (range: number | null | undefined, { MaxLtv, Safe } = PRESET_RANGES) => {
  test('range', `Range must be number between ${MaxLtv} and ${Safe}`, () => {
    enforce(range).isNumeric().gte(MaxLtv).lte(Safe)
  })
}

export const validateMaxDebt = (
  debt: Decimal | undefined | null,
  maxDebt: Decimal | undefined | null,
  isMaxDebtRequired: boolean,
) => {
  skipWhen(!isMaxDebtRequired, () => {
    test('maxDebt', 'Maximum debt must be calculated before debt can be validated', () => {
      enforce(maxDebt).isNotNullish()
    })
  })
  skipWhen(maxDebt == null || debt == null, () => {
    test('maxDebt', 'Debt is too high', () => {
      enforce(maxDebt).isNotNullish()
      enforce(debt).lte(maxDebt)
    })
  })
}

export const validateLeverageEnabled = (leverageEnabled: boolean | undefined | null, isLeverageRequired: boolean) => {
  skipWhen(!isLeverageRequired, () => {
    test('leverageEnabled', 'Leverage must be enabled', () => {
      enforce(leverageEnabled).equals(true)
    })
  })
}

export const validateMaxCollateral = (
  userCollateral: Decimal | undefined | null,
  maxCollateral: Decimal | undefined | null,
  errorMessage?: string,
) => {
  skipWhen(userCollateral == null || maxCollateral == null, () => {
    test('userCollateral', errorMessage ?? 'Collateral must be less than or equal to your wallet balance', () => {
      enforce(userCollateral).lte(maxCollateral)
    })
  })
}

export const validateIsFull = (value: boolean | undefined | null) => {
  test('root', 'Form is not completely filled out', () => {
    enforce(value).isBoolean()
  })
}
