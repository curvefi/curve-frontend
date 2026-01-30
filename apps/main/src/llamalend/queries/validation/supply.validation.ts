import { enforce, skipWhen, test } from 'vest'
import { getLlamaMarket, hasVault } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import type { UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { MakeOptional } from '@ui-kit/types/util'
import type { Decimal } from '@ui-kit/utils'

export type DepositMutation = {
  depositAmount: Decimal
}

type CalculatedDepositValues = {
  maxDepositAmount: Decimal | undefined
}
export type DepositForm = MakeOptional<DepositMutation, 'depositAmount'> & CalculatedDepositValues

export type DepositQuery<ChainId = number> = UserMarketQuery<ChainId> & DepositMutation
export type DepositParams<ChainId = number> = FieldsOf<DepositQuery<ChainId>>

export type WithdrawMutation = {
  withdrawAmount: Decimal
}

type CalculatedWithdrawValues = {
  maxWithdrawAmount: Decimal | undefined
}
export type WithdrawForm = MakeOptional<WithdrawMutation, 'withdrawAmount'> & CalculatedWithdrawValues

export type WithdrawQuery<ChainId = number> = UserMarketQuery<ChainId> & WithdrawMutation
export type WithdrawParams<ChainId = number> = FieldsOf<WithdrawQuery<ChainId>>

/**
 * Ensures the market has a vault and returns it.
 * Accepts either a market ID string or a LlamaMarketTemplate instance.
 * @throws Error if the market does not have a vault (only LendMarkets have vaults)
 */
export function requireVault(marketId: string): LendMarketTemplate
export function requireVault(market: LlamaMarketTemplate): LendMarketTemplate
export function requireVault(marketOrId: string | LlamaMarketTemplate): LendMarketTemplate {
  const market = typeof marketOrId === 'string' ? getLlamaMarket(marketOrId) : marketOrId
  if (!hasVault(market)) throw new Error('Market does not have a vault')
  return market
}

export const validateHasVault = (marketId: string | null | undefined) => {
  skipWhen(!marketId, () => {
    test('marketId', 'Market does not have a vault', () => {
      const market = getLlamaMarket(marketId!)
      enforce(hasVault(market)).isTruthy()
    })
  })
}

export const validateDepositAmount = (
  amount: Decimal | undefined | null,
  { depositRequired = false }: { depositRequired?: boolean } = {},
) => {
  test('depositAmount', 'Deposit amount must be a positive number', () => {
    if (depositRequired || amount != null) {
      enforce(amount).isNumeric().gt(0)
    }
  })
}

const validateDepositMaxAmount = (amount: Decimal | undefined | null, maxAmount: Decimal | undefined | null) => {
  skipWhen(amount == null || maxAmount == null, () => {
    test('depositAmount', `Amount exceeds maximum of ${maxAmount}`, () => {
      enforce(amount).lte(maxAmount)
    })
  })
}

// Form validation suite (for real-time form validation)
export const depositFormValidationSuite = createValidationSuite(
  ({ depositAmount = '0', maxDepositAmount }: DepositForm) => {
    validateDepositAmount(depositAmount)
    validateDepositMaxAmount(depositAmount, maxDepositAmount)
  },
)

// Query validation suite (for API queries)
const depositValidationGroup = <IChainId extends number>({
  marketId,
  depositAmount = '0',
}: DepositParams<IChainId>) => {
  validateHasVault(marketId)
  validateDepositAmount(depositAmount, { depositRequired: true })
}

export const depositValidationSuite = createValidationSuite((params: DepositParams) => {
  userMarketValidationSuite(params)
  depositValidationGroup(params)
})

export const userSuppliedAmountValidationSuite = createValidationSuite((params: DepositParams) => {
  userMarketValidationSuite(params)
  validateHasVault(params.marketId)
})

export const validateWithdrawAmount = (
  amount: Decimal | undefined | null,
  { withdrawRequired = false }: { withdrawRequired?: boolean } = {},
) => {
  test('withdrawAmount', 'Withdraw amount must be a positive number', () => {
    if (withdrawRequired || amount != null) {
      enforce(amount).isNumeric().gt(0)
    }
  })
}

const validateWithdrawMaxAmount = (amount: Decimal | undefined | null, maxAmount: Decimal | undefined | null) => {
  skipWhen(amount == null || maxAmount == null, () => {
    test('withdrawAmount', `Amount exceeds maximum of ${maxAmount}`, () => {
      enforce(amount).lte(maxAmount)
    })
  })
}

// Form validation suite (for real-time form validation)
export const withdrawFormValidationSuite = createValidationSuite(
  ({ withdrawAmount = '0', maxWithdrawAmount }: WithdrawForm) => {
    validateWithdrawAmount(withdrawAmount)
    validateWithdrawMaxAmount(withdrawAmount, maxWithdrawAmount)
  },
)

const withdrawValidationGroup = <IChainId extends number>({
  marketId,
  withdrawAmount = '0',
}: WithdrawParams<IChainId>) => {
  validateHasVault(marketId)
  validateWithdrawAmount(withdrawAmount, { withdrawRequired: true })
}

export const withdrawValidationSuite = createValidationSuite((params: WithdrawParams) => {
  userMarketValidationSuite(params)
  withdrawValidationGroup(params)
})
