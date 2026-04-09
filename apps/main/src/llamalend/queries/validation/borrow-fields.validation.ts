import { enforce, skipWhen, test } from 'vest'
import { PRESET_RANGES } from '@/llamalend/constants'
import { getLlamaMarket, hasLeverage, hasLeverageValue } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { Decimal } from '@primitives/decimal.utils'

export const validateUserBorrowed = (userBorrowed: Decimal | null | undefined) => {
  test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
    enforce(userBorrowed).isDecimal().gte(0)
  })
}

export const validateUserCollateral = (
  userCollateral: Decimal | undefined | null,
  { required }: { required: boolean },
) => {
  skipWhen(!required, () => {
    test('userCollateral', 'Collateral amount is required', () => {
      enforce(userCollateral).isNotEmpty()
    })
  })
  skipWhen(userCollateral == null, () => {
    test('userCollateral', `Collateral amount must be a ${required ? 'positive' : 'non-negative'} number`, () => {
      enforce(userCollateral).isDecimal()[required ? 'gt' : 'gte'](0)
    })
  })
}

export const validateDebt = (debt: Decimal | undefined | null, { required = true }: { required?: boolean } = {}) => {
  skipWhen(!required, () => {
    test('debt', 'Debt is required', () => {
      enforce(debt).isNotEmpty()
    })
  })
  skipWhen(!debt, () => {
    test('debt', `Debt must be a positive number${required ? '' : ' or empty'}`, () => {
      enforce(debt).isDecimal().gt(0)
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
  { required }: { required: boolean },
) => {
  skipWhen(!required, () => {
    test('maxDebt', 'Maximum debt must be calculated before debt can be validated', () => {
      enforce(maxDebt).isDecimal()
    })
  })
  skipWhen(maxDebt == null || debt == null, () => {
    test('maxDebt', `The given debt exceeds the maximum of ${maxDebt}`, () => {
      enforce(debt).lte(maxDebt)
    })
  })
}

export const validateLeverageEnabled = (
  leverageEnabled: boolean | undefined | null,
  { required }: { required: boolean },
) => {
  skipWhen(!required, () => {
    test('leverageEnabled', 'Leverage must be enabled', () => {
      enforce(leverageEnabled).equals(true)
    })
  })
}

export const validateLeverageSupported = (
  marketId: LlamaMarketTemplate | string | null | undefined,
  { required }: { required: boolean },
) => {
  skipWhen(!required || !marketId, () => {
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
    required,
  }: {
    label: string
    maxBorrowed: Decimal | undefined | null
    required: boolean
  },
) => {
  skipWhen(!required || !userBorrowed, () => {
    test('maxBorrowed', 'Maximum borrow must be calculated before it can be validated', () => {
      enforce(maxBorrowed).isDecimal()
    })
  })
  skipWhen(userBorrowed == null || maxBorrowed == null, () => {
    test('userBorrowed', `The maximum ${label} is ${maxBorrowed}`, () => {
      enforce(userBorrowed).lessThanOrEquals(maxBorrowed)
    })
  })
}

export const validateMaxCollateral = (
  userCollateral: Decimal | undefined | null,
  maxCollateral: Decimal | undefined | null,
  { required }: { required: boolean },
) => {
  skipWhen(!required || !userCollateral, () => {
    test('maxCollateral', 'Maximum collateral must be calculated before collateral can be validated', () => {
      enforce(maxCollateral).isDecimal()
    })
  })
  skipWhen(!userCollateral || !maxCollateral, () => {
    test('maxCollateral', `The maximum collateral amount is ${maxCollateral}`, () => {
      enforce(userCollateral).lessThanOrEquals(maxCollateral)
    })
  })
}

export const validateMaxStateCollateral = (
  stateCollateral: Decimal | null | undefined,
  maxStateCollateral: Decimal | null | undefined,
  { required }: { required: boolean },
) => {
  skipWhen(!required || !stateCollateral, () => {
    test('maxStateCollateral', 'Maximum state collateral must be calculated before collateral can be validated', () => {
      enforce(maxStateCollateral).isDecimal()
    })
  })
  skipWhen(stateCollateral == null || maxStateCollateral == null, () => {
    test('maxStateCollateral', 'Collateral cannot exceed the amount in your wallet', () => {
      enforce(stateCollateral).lte(maxStateCollateral)
    })
  })
}

export const validateIsFull = (value: boolean | undefined | null) => {
  test('isFull', `isFull must be calculated`, () => {
    enforce(value).isBoolean()
  })
}
