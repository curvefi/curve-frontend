import { enforce, skipWhen, test } from 'vest'
import { getLlamaMarket, hasGauge, hasVault } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import type { UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
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

export type StakeMutation = {
  stakeAmount: Decimal
}

type CalculatedStakeValues = {
  maxStakeAmount: Decimal | undefined
}
export type StakeForm = MakeOptional<StakeMutation, 'stakeAmount'> & CalculatedStakeValues

export type StakeQuery<ChainId = number> = UserMarketQuery<ChainId> & StakeMutation
export type StakeParams<ChainId = number> = FieldsOf<StakeQuery<ChainId>>

export type UnstakeMutation = {
  unstakeAmount: Decimal
}

type CalculatedUnstakeValues = {
  maxUnstakeAmount: Decimal | undefined
}
export type UnstakeForm = MakeOptional<UnstakeMutation, 'unstakeAmount'> & CalculatedUnstakeValues

export type UnstakeQuery<ChainId = number> = UserMarketQuery<ChainId> & UnstakeMutation
export type UnstakeParams<ChainId = number> = FieldsOf<UnstakeQuery<ChainId>>

export type ClaimType = 'crv' | 'rewards'

export type ClaimMutation = {
  claimType: ClaimType
}

export type ClaimQuery<ChainId = number> = UserMarketQuery<ChainId> & ClaimMutation
export type ClaimParams<ChainId = number> = FieldsOf<ClaimQuery<ChainId>>

export type SharesToAssetsQuery<ChainId = number> = UserMarketQuery<ChainId> & { shares: Decimal }
export type SharesToAssetsParams<ChainId = number> = FieldsOf<SharesToAssetsQuery<ChainId>>

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

export function requireGauge(marketId: string): LendMarketTemplate {
  const lendMarket = requireVault(marketId)
  if (!hasGauge(lendMarket)) throw new Error('Market does not have a gauge')
  return lendMarket
}

export const validateHasVault = (marketId: string | null | undefined) => {
  skipWhen(!marketId, () => {
    test('marketId', 'Market does not have a vault', () => {
      const market = getLlamaMarket(marketId!)
      enforce(hasVault(market)).isTruthy()
    })
  })
}

const validateHasGauge = (marketId: string | null | undefined) => {
  skipWhen(!marketId, () => {
    test('marketId', 'Market does not have a gauge', () => {
      const market = getLlamaMarket(marketId!)
      enforce(hasGauge(market)).isTruthy()
    })
  })
}

export const validateDepositAmount = (
  amount: Decimal | undefined | null,
  { depositRequired = false }: { depositRequired?: boolean } = {},
) => {
  skipWhen(!depositRequired && !amount, () => {
    test('depositAmount', 'Deposit amount must be a positive number', () => {
      enforce(amount).isNumeric().gt(0)
    })
  })
}

const validateDepositMaxAmount = (amount: Decimal | undefined | null, maxAmount: Decimal | undefined | null) => {
  skipWhen(amount == null || maxAmount == null, () => {
    test('depositAmount', `Amount exceeds maximum of ${maxAmount}`, () => {
      enforce(amount).lte(maxAmount)
    })
  })
}

const validateSharesToAssets = (shares: Decimal | undefined | null) => {
  test('shares', 'Shares must be a positive number', () => {
    enforce(shares).isNumeric().gt(0)
  })
}

// Form validation suite (for real-time form validation)
export const depositFormValidationSuite = createValidationSuite(
  ({ depositAmount = '0', maxDepositAmount }: DepositForm) => {
    validateDepositAmount(depositAmount)
    validateDepositMaxAmount(depositAmount, maxDepositAmount)
  },
)

const supplyUserValidationGroup = <IChainId extends number>(params: UserMarketParams<IChainId>) => {
  userMarketValidationSuite(params)
  validateHasVault(params.marketId)
}

export const depositValidationSuite = createValidationSuite((params: DepositParams) => {
  supplyUserValidationGroup(params)
  validateDepositAmount(params.depositAmount, { depositRequired: true })
})

export const claimableRewardsValidationSuite = createValidationSuite((params: UserMarketParams) => {
  supplyUserValidationGroup(params)
  validateHasGauge(params.marketId)
})

export const claimValidationSuite = createValidationSuite((params: ClaimParams) => {
  supplyUserValidationGroup(params)
  test('claimType', 'Claim type is required', () => {
    enforce(params.claimType).isNotEmpty()
  })
})

export const userSupplyVaultSharesValidationSuite = createValidationSuite((params: SharesToAssetsParams) => {
  supplyUserValidationGroup(params)
  validateSharesToAssets(params.shares)
})

const validateWithdrawAmount = (
  amount: Decimal | undefined | null,
  { withdrawRequired = false }: { withdrawRequired?: boolean } = {},
) => {
  skipWhen(!withdrawRequired && !amount, () => {
    test('withdrawAmount', 'Withdraw amount must be a positive number', () => {
      enforce(amount).isNumeric().gt(0)
    })
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

const validateStakeAmount = (
  amount: Decimal | undefined | null,
  { stakeRequired = false }: { stakeRequired?: boolean } = {},
) => {
  skipWhen(!stakeRequired && !amount, () => {
    test('stakeAmount', 'Stake amount must be a positive number', () => {
      enforce(amount).isNumeric().gt(0)
    })
  })
}

const validateStakeMaxAmount = (amount: Decimal | undefined | null, maxAmount: Decimal | undefined | null) => {
  skipWhen(amount == null || maxAmount == null, () => {
    test('stakeAmount', `Amount exceeds maximum of ${maxAmount}`, () => {
      enforce(amount).lte(maxAmount)
    })
  })
}

export const stakeFormValidationSuite = createValidationSuite(({ stakeAmount = '0', maxStakeAmount }: StakeForm) => {
  validateStakeAmount(stakeAmount)
  validateStakeMaxAmount(stakeAmount, maxStakeAmount)
})

const stakeValidationGroup = <IChainId extends number>({ marketId, stakeAmount = '0' }: StakeParams<IChainId>) => {
  validateHasVault(marketId)
  validateStakeAmount(stakeAmount, { stakeRequired: true })
}

export const stakeValidationSuite = createValidationSuite((params: StakeParams) => {
  userMarketValidationSuite(params)
  stakeValidationGroup(params)
})

const validateUnstakeAmount = (
  amount: Decimal | undefined | null,
  { unstakeRequired = false }: { unstakeRequired?: boolean } = {},
) => {
  skipWhen(!unstakeRequired && !amount, () => {
    test('unstakeAmount', 'Unstake amount must be a positive number', () => {
      enforce(amount).isNumeric().gt(0)
    })
  })
}

const validateUnstakeMaxAmount = (amount: Decimal | undefined | null, maxAmount: Decimal | undefined | null) => {
  skipWhen(amount == null || maxAmount == null, () => {
    test('unstakeAmount', `Amount exceeds maximum of ${maxAmount}`, () => {
      enforce(amount).lte(maxAmount)
    })
  })
}

export const unstakeFormValidationSuite = createValidationSuite(
  ({ unstakeAmount = '0', maxUnstakeAmount }: UnstakeForm) => {
    validateUnstakeAmount(unstakeAmount)
    validateUnstakeMaxAmount(unstakeAmount, maxUnstakeAmount)
  },
)

const unstakeValidationGroup = <IChainId extends number>({
  marketId,
  unstakeAmount = '0',
}: UnstakeParams<IChainId>) => {
  validateHasVault(marketId)
  validateUnstakeAmount(unstakeAmount, { unstakeRequired: true })
}

export const unstakeValidationSuite = createValidationSuite((params: UnstakeParams) => {
  userMarketValidationSuite(params)
  unstakeValidationGroup(params)
})
