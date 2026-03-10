import { enforce, skipWhen, test } from 'vest'
import { PRESET_RANGES } from '@/llamalend/constants'
import { getLlamaMarket, hasLeverage, hasLeverageValue } from '@/llamalend/llama.utils'
import type { Decimal } from '@primitives/decimal.utils'

export const validateUserBorrowed = (userBorrowed: Decimal | null | undefined) => {
  test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
    enforce(userBorrowed).isNumeric().gte(0)
  })
}

export const validateUserCollateral = (userCollateral: Decimal | undefined | null, required: boolean = true) => {
  test('userCollateral', `Collateral amount must be a non-negative number`, () => {
    if (required || userCollateral != null) {
      enforce(userCollateral).isNumeric().gte(0)
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
      enforce(maxDebt).isNumeric()
    })
  })
  skipWhen(maxDebt == null || debt == null, () => {
    test('maxDebt', `The given debt exceeds the maximum of ${maxDebt}`, () => {
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

export const validateLeverageSupported = (marketId: string | null | undefined, leverageRequired: boolean) => {
  skipWhen(!leverageRequired || !marketId, () => {
    test('marketId', 'Market does not support leverage', () => {
      const market = getLlamaMarket(marketId!)
      enforce(hasLeverage(market)).isTruthy()
    })
  })
}

export const validateLeverageValuesSupported = (marketId: string | null | undefined) => {
  skipWhen(!marketId, () => {
    test('marketId', 'Market does not support leverage values', () => {
      const market = getLlamaMarket(marketId!)
      enforce(hasLeverageValue(market)).isTruthy()
    })
  })
}

export const validateRoute = (routeId: string | null | undefined, isRequired: boolean) => {
  skipWhen(!isRequired && !routeId, () => {
    test('routeId', 'Route is required', () => {
      enforce(routeId).isTruthy()
    })
  })
}

export const validateMaxBorrowed = (
  userBorrowed: Decimal | undefined | null,
  {
    maxBorrowed,
    label,
  }: {
    label: string
    maxBorrowed: Decimal | undefined | null
  },
) => {
  skipWhen(userBorrowed == null || maxBorrowed == null, () => {
    test('userBorrowed', `The maximum ${label} is ${maxBorrowed}`, () => {
      enforce(userBorrowed).lessThanOrEquals(maxBorrowed)
    })
  })
}

export const validateMaxCollateral = (
  userCollateral: Decimal | undefined | null,
  maxCollateral: Decimal | undefined | null,
) => {
  skipWhen(userCollateral == null || maxCollateral == null, () => {
    test('userCollateral', `The maximum collateral amount is ${maxCollateral}`, () => {
      enforce(userCollateral).lessThanOrEquals(maxCollateral)
    })
  })
}

export const validateIsFull = (value: boolean | undefined | null) => {
  test('isFull', `isFull must be calculated`, () => {
    enforce(value).isBoolean()
  })
}
