import { enforce, skipWhen, test } from 'vest'
import { getLlamaMarket, hasVault } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup } from '@ui-kit/lib/model/query/market-id-validation'
import type { MarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { userAddressValidationGroup } from '@ui-kit/lib/model/query/user-address-validation'
import type { MakeOptional } from '@ui-kit/types/util'
import type { Decimal } from '@ui-kit/utils'

type CompleteDepositForm = {
  depositAmount: Decimal
}

type CalculatedDepositValues = {
  maxDepositAmount: Decimal | undefined
}
export type DepositMutation = CompleteDepositForm
export type DepositForm = MakeOptional<CompleteDepositForm, 'depositAmount'> & CalculatedDepositValues

export type DepositQuery<ChainId = number> = UserMarketQuery<ChainId> & CompleteDepositForm
export type DepositParams<ChainId = number> = FieldsOf<DepositQuery<ChainId>>

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

const validateDepositAmount = (
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
export const depositValidationGroup = <IChainId extends number>({
  chainId,
  marketId,
  depositAmount = '0',
  userAddress,
}: DepositParams<IChainId>) => {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
  userAddressValidationGroup({ userAddress })
  validateHasVault(marketId)
  validateDepositAmount(depositAmount, { depositRequired: true })
}

export const depositValidationSuite = createValidationSuite((params: DepositParams) => depositValidationGroup(params))

export const depositMutationValidationSuite = createValidationSuite((params: DepositParams) => {
  depositValidationGroup(params)
})
