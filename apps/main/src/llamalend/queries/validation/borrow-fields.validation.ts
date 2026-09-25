import { skipWhen, test } from 'vest'
import { PRESET_RANGES } from '@/llamalend/constants'
import { getMarket, hasLeverage, hasLeverageValue, hasUpgradedZapV2, tryGetMarket } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { assertRouteProvider, getRouteQueryData, isZapV2RouterCalldataTooLarge } from '@evm-ui/entities/router-api'
import type { Decimal } from '@primitives/decimal.utils'
import { type Nullish, maybe } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { enforce } from '@ui/lib/validation/enforce-extension'

export const validateUserBorrowed = (userBorrowed: Decimal | Nullish) => {
  test('userBorrowed', 'Borrow amount must be a non-negative number', () => {
    enforce(userBorrowed).isDecimal().gte(0)
  })
}

export const validateUserCollateral = (userCollateral: Decimal | Nullish, { required }: { required: boolean }) => {
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

export const validateDebt = (debt: Decimal | Nullish, { required = true }: { required?: boolean } = {}) => {
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

export const validateRange = (range: number | Nullish, { MaxLtv, Safe } = PRESET_RANGES) => {
  test('range', `Range must be number between ${MaxLtv} and ${Safe}`, () => {
    enforce(range).isNumeric().gte(MaxLtv).lte(Safe)
  })
}

export const validateMaxDebt = (
  debt: Decimal | Nullish,
  maxDebt: Decimal | Nullish,
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

export const validateLeverageEnabled = (leverageEnabled: boolean | Nullish, { required }: { required: boolean }) => {
  skipWhen(!required, () => {
    test('leverageEnabled', 'Leverage must be enabled', () => {
      enforce(leverageEnabled).equals(true)
    })
  })
}

export const validateLeverageSupported = (
  marketId: MarketTemplate | string | Nullish,
  { required }: { required: boolean },
) => {
  const market = tryGetMarket(marketId)
  skipWhen(!required || !market, () => {
    test('marketId', 'Market does not support leverage', () => {
      const market = getMarket(marketId!)
      enforce(hasLeverage(market)).isTruthy()
    })
  })
}

export const validateLeverageValuesSupported = (marketId: MarketTemplate | string | Nullish, required = true) => {
  const market = tryGetMarket(marketId)
  skipWhen(!market || !required, () => {
    test('marketId', 'Market does not support leverage values', () => {
      enforce(hasLeverageValue(market)).isTruthy()
    })
  })
}

export const validateRoute = (routeId: string | Nullish, isRequired: boolean) => {
  skipWhen(!isRequired && !routeId, () => {
    test('routeId', 'Route is required', () => {
      enforce(routeId).isTruthy()
    })
  })
}

export const validateRouteCalldata = (routeId: string | Nullish, market: MarketTemplate | Nullish) => {
  skipWhen(!routeId || hasUpgradedZapV2(market), () => {
    test(
      'routeId',
      'The selected route is too large to execute. Select another route provider, reduce the amount, or split the operation into multiple transactions.',
      () => {
        const route = maybe(routeId, routeId => getRouteQueryData({ routeId }))
        enforce(isZapV2RouterCalldataTooLarge(route?.tx?.data)).isFalsy()
      },
    )
  })
}

export const validateRouteProvider = (
  routeId: string | Nullish,
  providers: readonly RouteProvider[] | undefined,
  isRequired: boolean,
) => {
  skipWhen(!isRequired || !routeId, () => {
    test('routeId', 'Route provider is not enabled', () => {
      assertRouteProvider(routeId ?? undefined, providers)
    })
  })
}

export const validateMaxBorrowed = (
  userBorrowed: Decimal | Nullish,
  { maxBorrowed, label, required }: { label: string; maxBorrowed: Decimal | Nullish; required: boolean },
) => {
  skipWhen(!required || !userBorrowed, () => {
    test('maxBorrowed', 'Maximum borrow must be calculated before it can be validated', () => {
      enforce(maxBorrowed).isDecimal()
    })
  })
  skipWhen(maxBorrowed == null, () => {
    test('userBorrowed', `The maximum ${label} is ${maxBorrowed}`, () => {
      enforce(userBorrowed ?? '0').lessThanOrEquals(maxBorrowed)
    })
  })
}

export const validateMaxCollateral = (
  userCollateral: Decimal | Nullish,
  maxCollateral: Decimal | Nullish,
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
  stateCollateral: Decimal | Nullish,
  maxStateCollateral: Decimal | Nullish,
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

export const validateIsFull = (value: boolean | Nullish) => {
  test('isFull', `isFull must be calculated`, () => {
    enforce(value).isBoolean()
  })
}
