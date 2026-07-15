import { enforce, skipWhen, test } from 'vest'
import { hasResetPosition, tryGetMarket } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { getResetDebtReduction } from '@/llamalend/queries/reset/reset-query.helpers'
import { validateMaxBorrowed } from '@/llamalend/queries/validation/borrow-fields.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import type { UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { MakeOptional } from '@ui-kit/types/util'
import { decimalGreaterThan } from '@ui-kit/utils'

type ResetInputs = {
  /** The amount of borrow tokens already converted from collateral in the user's band */
  convertedBorrowed: Decimal
  /** The amount of borrow tokens entered by the user to pay from their wallet; this goes into the `repay` function's debt argument */
  userBorrowed: Decimal
}

type ResetCalculatedValues = {
  /** User's wallet balance of the borrow token; caps `userBorrowed` */
  maxBorrowed: Decimal | undefined
  /** Current outstanding debt capping convertedBorrowed + userBorrowed (we route users to the close tab for full repayments) */
  maxTotalBorrowed: Decimal | undefined
  /** Minimum wallet amount (userBorrowed) required to reset; returned by `tokensToShrink` */
  minBorrowed: Decimal | undefined
  /** Whether the user's position can be reset with repay shrink */
  resetAvailable: boolean | undefined
}

export type ResetForm = MakeOptional<ResetInputs, 'convertedBorrowed' | 'userBorrowed'> & ResetCalculatedValues

export type ResetQuery<ChainId = IChainId> = UserMarketQuery<ChainId> & ResetInputs & ResetCalculatedValues
export type ResetParams<ChainId = IChainId> = FieldsOf<ResetQuery<ChainId>>

const validateResetSupported = (marketId: MarketTemplate | string | null | undefined) => {
  const market = maybe(marketId, id => tryGetMarket(id))
  skipWhen(!market, () => {
    test('marketId', 'Reset is only available for Llamalend v2 lend markets', () => {
      enforce(hasResetPosition(market)).isTruthy()
    })
  })
}

const validateAmount = (field: keyof ResetInputs, label: string, value: Decimal | null | undefined) => {
  skipWhen(value == null, () => {
    test(field, `${label} must be a non-negative number`, () => {
      enforce(value).isDecimal().gte(0)
    })
  })
}

const validateMaxUserBorrowed = (userBorrowed: Decimal | null | undefined, maxBorrowed: Decimal | null | undefined) => {
  skipWhen(!userBorrowed, () => {
    test('maxBorrowed', 'Wallet balance must be loaded before it can be validated', () => {
      enforce(maxBorrowed).isDecimal()
    })
  })
  validateMaxBorrowed(userBorrowed, { label: `reset amount`, maxBorrowed, required: false })
}

const validateMinimumResetAmount = (
  userBorrowed: Decimal | null | undefined,
  minBorrowed: Decimal | null | undefined,
) => {
  test('minBorrowed', 'Minimum reset amount must be loaded before it can be validated', () => {
    enforce(minBorrowed).isDecimal()
  })
  skipWhen(minBorrowed == null, () => {
    test('userBorrowed', `Add at least ${minBorrowed} from wallet to reset this position`, () => {
      enforce(userBorrowed ?? '0').gte(minBorrowed)
    })
  })
}

const validateMaxDebtReduction = (
  convertedBorrowed: Decimal | null | undefined,
  userBorrowed: Decimal | null | undefined,
  maxTotalBorrowed: Decimal | null | undefined,
) => {
  const debtReduction = getResetDebtReduction({ convertedBorrowed, userBorrowed })

  test('maxTotalBorrowed', 'Total borrowed amount must be loaded before it can be validated', () => {
    enforce(maxTotalBorrowed).isDecimal()
  })
  skipWhen(maxTotalBorrowed == null, () => {
    test('userBorrowed', 'Use the close tab to fully repay and close this position', () => {
      enforce(decimalGreaterThan(maxTotalBorrowed!, debtReduction)).isTruthy()
    })
  })
}

const validateResetAvailable = (
  resetAvailable: boolean | null | undefined,
  { requireLoaded }: { requireLoaded: boolean },
) => {
  if (requireLoaded) {
    test('root', 'Reset availability must be loaded before it can be validated', () => {
      enforce(resetAvailable != null).isTruthy()
    })
  }
  skipWhen(resetAvailable == null, () => {
    test('root', 'Reset is only available for soft-liquidation positions with enough non-converted bands', () => {
      enforce(resetAvailable).isTruthy()
    })
  })
}

const resetValidationGroup = (
  { convertedBorrowed, userBorrowed, maxBorrowed, maxTotalBorrowed, minBorrowed, resetAvailable }: FieldsOf<ResetForm>,
  { requireLoadedAvailability }: { requireLoadedAvailability: boolean },
) => {
  validateResetAvailable(resetAvailable, { requireLoaded: requireLoadedAvailability })
  skipWhen(!resetAvailable, () => {
    validateAmount('convertedBorrowed', 'Converted collateral', convertedBorrowed)
    validateAmount('userBorrowed', 'Wallet amount', userBorrowed)
    validateMaxUserBorrowed(userBorrowed, maxBorrowed)
    validateMinimumResetAmount(userBorrowed, minBorrowed)
    validateMaxDebtReduction(convertedBorrowed, userBorrowed, maxTotalBorrowed)
  })
}

export const resetSupportedValidationSuite = createValidationSuite(
  ({ chainId, marketId, userAddress }: UserMarketParams<IChainId>) => {
    userMarketValidationSuite({ chainId, marketId, userAddress })
    validateResetSupported(marketId)
  },
)

export const resetValidationSuite = createValidationSuite(
  ({ chainId, marketId, userAddress, ...params }: ResetParams) => {
    userMarketValidationSuite({ chainId, marketId, userAddress })
    validateResetSupported(marketId)
    resetValidationGroup(params, { requireLoadedAvailability: true })
  },
)

export const resetFormValidationSuite = (market: MarketTemplate | undefined) =>
  createValidationSuite((params: ResetForm) => {
    validateResetSupported(market)
    resetValidationGroup(params, { requireLoadedAvailability: false })
  })
