import { enforce, skipWhen, test } from 'vest'
import { getLlamaMarket, hasGauge, hasVault, tryGetLlamaMarket } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Decimal } from '@primitives/decimal.utils'
import { assert } from '@primitives/objects.utils'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import type { UserMarketParams, UserMarketQuery } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { MakeOptional } from '@ui-kit/types/util'

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
  isFull: boolean
  userVaultShares: Decimal
}

type CalculatedWithdrawValues = {
  maxWithdrawAmount: Decimal | undefined
}
export type WithdrawForm = MakeOptional<WithdrawMutation, 'withdrawAmount' | 'userVaultShares'> &
  CalculatedWithdrawValues

export type WithdrawQuery<ChainId = number> = UserMarketQuery<ChainId> & WithdrawMutation
export type WithdrawParams<ChainId = number> = FieldsOf<WithdrawQuery<ChainId>>

export type StakeMutation = {
  stakeShares: Decimal
}

type CalculatedStakeValues = {
  maxStakeAssets: Decimal | undefined
}
export type StakeForm = MakeOptional<StakeMutation, 'stakeShares'> &
  CalculatedStakeValues & {
    stakeAssets?: Decimal
  }

export type StakeQuery<ChainId = number> = UserMarketQuery<ChainId> & StakeMutation
export type StakeParams<ChainId = number> = FieldsOf<StakeQuery<ChainId>>
export type StakeFormQuery<ChainId = number> = StakeQuery<ChainId> & Required<Pick<StakeForm, 'stakeAssets'>>
export type StakeFormParams<ChainId = number> = FieldsOf<StakeFormQuery<ChainId>>

export type UnstakeMutation = {
  unstakeShares: Decimal
}

type CalculatedUnstakeValues = {
  maxUnstakeAssets: Decimal | undefined
}
export type UnstakeForm = MakeOptional<UnstakeMutation, 'unstakeShares'> &
  CalculatedUnstakeValues & {
    unstakeAssets?: Decimal
  }

export type UnstakeQuery<ChainId = number> = UserMarketQuery<ChainId> & UnstakeMutation
export type UnstakeParams<ChainId = number> = FieldsOf<UnstakeQuery<ChainId>>
export type UnstakeFormQuery<ChainId = number> = UnstakeQuery<ChainId> & Required<Pick<UnstakeForm, 'unstakeAssets'>>
export type UnstakeFormParams<ChainId = number> = FieldsOf<UnstakeFormQuery<ChainId>>

export type AssetsToSharesQuery<ChainId = number> = UserMarketQuery<ChainId> & { assets: Decimal }
export type AssetsToSharesParams<ChainId = number> = FieldsOf<AssetsToSharesQuery<ChainId>>

/**
 * Ensures the market has a vault and returns it.
 * Accepts either a market ID string or a LlamaMarketTemplate instance.
 * @throws Error if the market does not have a vault (only LendMarkets have vaults)
 */
export function requireVault(marketId: string | LlamaMarketTemplate): LendMarketTemplate {
  const market = getLlamaMarket(marketId)
  assert(hasVault(market), 'Market does not have a vault')
  return market as LendMarketTemplate
}

export function requireGauge(marketId: string): LendMarketTemplate {
  const lendMarket = requireVault(marketId)
  assert(hasGauge(lendMarket), 'Market does not have a gauge')
  return lendMarket
}

const validateHasVault = (marketId: string | null | undefined) => {
  const market = tryGetLlamaMarket(marketId)
  skipWhen(!market, () => {
    test('marketId', 'Market does not have a vault', () => {
      enforce(market && hasVault(market)).isTruthy()
    })
  })
}

const validateHasGauge = (marketId: string | null | undefined) => {
  const market = tryGetLlamaMarket(marketId)
  skipWhen(!market, () => {
    test('marketId', 'Market does not have a gauge', () => {
      enforce(market && hasGauge(market)).isTruthy()
    })
  })
}

const validateDepositAmount = (
  amount: Decimal | undefined | null,
  { depositRequired = false }: { depositRequired?: boolean } = {},
) => {
  skipWhen(!depositRequired, () => {
    test('depositAmount', 'Deposit amount is required', () => {
      enforce(amount).isNotEmpty()
    })
  })
  skipWhen(!amount, () => {
    test('depositAmount', 'Deposit amount must be a positive number', () => {
      enforce(amount).isDecimal().gt(0)
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

const validateAssetsToShares = (assets: Decimal | undefined | null) => {
  test('assets', 'Assets are required', () => {
    enforce(assets).isNotEmpty()
  })
  skipWhen(!assets, () => {
    test('assets', 'Assets must be a non-negative number', () => {
      enforce(assets).isDecimal().gte(0)
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

const supplyUserValidationGroup = <IChainId extends number>(params: UserMarketParams<IChainId>) => {
  userMarketValidationSuite(params)
  validateHasVault(params.marketId)
}

export const supplyUserValidationSuite = createValidationSuite<UserMarketParams>(params => {
  supplyUserValidationGroup(params)
})

export const depositValidationSuite = createValidationSuite((params: DepositParams) => {
  supplyUserValidationGroup(params)
  validateDepositAmount(params.depositAmount, { depositRequired: true })
})

export const claimableRewardsValidationSuite = createValidationSuite((params: UserMarketParams) => {
  supplyUserValidationGroup(params)
  validateHasGauge(params.marketId)
})

export const claimValidationSuite = createValidationSuite((params: UserMarketParams) => {
  supplyUserValidationGroup(params)
})

export const userSupplyVaultAssetsValidationSuite = createValidationSuite((params: AssetsToSharesParams) => {
  supplyUserValidationGroup(params)
  validateAssetsToShares(params.assets)
})

const validateWithdrawAmount = (
  amount: Decimal | undefined | null,
  { withdrawRequired = false }: { withdrawRequired?: boolean } = {},
) => {
  skipWhen(!withdrawRequired, () => {
    test('withdrawAmount', 'Withdraw amount is required', () => {
      enforce(amount).isNotEmpty()
    })
  })
  skipWhen(!amount, () => {
    test('withdrawAmount', 'Withdraw amount must be a positive number', () => {
      enforce(amount).isDecimal().gt(0)
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

const validateUserVaultShares = (
  shares: Decimal | undefined | null,
  { sharesRequired = false }: { sharesRequired?: boolean } = {},
) => {
  skipWhen(!sharesRequired, () => {
    test('userVaultShares', 'Vault shares are required', () => {
      enforce(shares).isNotEmpty()
    })
  })
  skipWhen(shares == null, () => {
    test('userVaultShares', 'Vault shares must be a positive number', () => {
      enforce(shares).isDecimal().gt(0)
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
  validateUserVaultShares(params.userVaultShares, { sharesRequired: !!params.isFull })
})

const validateStakeAssets = (
  assets: Decimal | undefined | null,
  { stakeRequired = false }: { stakeRequired?: boolean } = {},
) => {
  skipWhen(!stakeRequired, () => {
    test('stakeAssets', 'Stake amount is required', () => {
      enforce(assets).isNotEmpty()
    })
  })
  skipWhen(!assets, () => {
    test('stakeAssets', 'Stake amount must be a positive number', () => {
      enforce(assets).isDecimal().gt(0)
    })
  })
}

const validateStakeShares = (shares: Decimal | undefined | null) => {
  test('stakeShares', 'Stake shares are required', () => {
    enforce(shares).isNotEmpty()
  })
  skipWhen(!shares, () => {
    test('stakeShares', 'Stake shares must be a positive number', () => {
      enforce(shares).isDecimal().gt(0)
    })
  })
}

const validateStakeMaxAssets = (assets: Decimal | undefined | null, maxAssets: Decimal | undefined | null) => {
  skipWhen(assets == null || maxAssets == null, () => {
    test('stakeAssets', `Amount exceeds maximum of ${maxAssets}`, () => {
      enforce(assets).lte(maxAssets)
    })
  })
}

export const stakeFormValidationSuite = createValidationSuite(({ stakeAssets = '0', maxStakeAssets }: StakeForm) => {
  validateStakeAssets(stakeAssets)
  validateStakeMaxAssets(stakeAssets, maxStakeAssets)
})

export const stakeValidationSuite = createValidationSuite((params: UserMarketParams & StakeMutation) => {
  userMarketValidationSuite(params)
  validateHasVault(params.marketId)
  validateStakeShares(params.stakeShares)
})

const validateUnstakeAssets = (
  assets: Decimal | undefined | null,
  { unstakeRequired = false }: { unstakeRequired?: boolean } = {},
) => {
  skipWhen(!unstakeRequired, () => {
    test('unstakeAssets', 'Unstake amount is required', () => {
      enforce(assets).isNotEmpty()
    })
  })
  skipWhen(!assets, () => {
    test('unstakeAssets', 'Unstake amount must be a positive number', () => {
      enforce(assets).isDecimal().gt(0)
    })
  })
}

const validateUnstakeShares = (shares: Decimal | undefined | null) => {
  test('unstakeShares', 'Unstake shares are required', () => {
    enforce(shares).isNotEmpty()
  })
  skipWhen(!shares, () => {
    test('unstakeShares', 'Unstake shares must be a positive number', () => {
      enforce(shares).isDecimal().gt(0)
    })
  })
}

const validateUnstakeMaxAssets = (assets: Decimal | undefined | null, maxAssets: Decimal | undefined | null) => {
  skipWhen(assets == null || maxAssets == null, () => {
    test('unstakeAssets', `Amount exceeds maximum of ${maxAssets}`, () => {
      enforce(assets).lte(maxAssets)
    })
  })
}

export const unstakeFormValidationSuite = createValidationSuite(
  ({ unstakeAssets = '0', maxUnstakeAssets }: UnstakeForm) => {
    validateUnstakeAssets(unstakeAssets)
    validateUnstakeMaxAssets(unstakeAssets, maxUnstakeAssets)
  },
)

export const unstakeValidationSuite = createValidationSuite((params: UserMarketParams & UnstakeMutation) => {
  userMarketValidationSuite(params)
  validateHasVault(params.marketId)
  validateUnstakeShares(params.unstakeShares)
})
