import type {
  ApproveDeposit,
  Deposit,
  DepositBalancedAmounts,
  DepositDetails,
  DepositEstGasApproval,
  DepositSeedAmounts,
  PoolBase,
  PoolSignerBase,
  Stake,
  StakeEstGasApproval,
} from '@/entities/deposit/types'

export const keys = {
  base: ({ chainId, poolId }: PoolBase) => {
    return ['depositBase', chainId, poolId] as const
  },
  signerBase: ({ chainId, signerAddress, poolId }: PoolSignerBase) =>
    ['depositSignerBase', chainId, signerAddress, poolId] as const,

  // query
  depositSeedAmounts: ({ isSeed, isCrypto, isMeta, firstAmount, ...rest }: DepositSeedAmounts) => {
    return ['depositSeedAmounts', ...keys.base(rest), isSeed, isCrypto, isMeta, firstAmount] as const
  },
  depositBalancedAmounts: ({ isBalancedAmounts, isWrapped, ...rest }: DepositBalancedAmounts) => {
    return ['depositBalancedAmounts', ...keys.base(rest), isBalancedAmounts, isWrapped] as const
  },
  depositDetails: ({ formType, isSeed, amounts, isWrapped, maxSlippage, ...rest }: DepositDetails) => {
    return ['depositDetails', ...keys.base(rest), formType, isSeed, isWrapped, amounts, maxSlippage] as const
  },
  depositEstGasApproval: ({ formType, amounts, amountsError, isWrapped, ...rest }: DepositEstGasApproval) => {
    return ['depositEstGasApproval', ...keys.signerBase(rest), formType, amounts, amountsError, isWrapped] as const
  },
  stakeEstGasApproval: ({ lpToken, lpTokenError, ...rest }: StakeEstGasApproval) => {
    return ['stakeEstGasApproval', ...keys.signerBase(rest), lpToken, lpTokenError] as const
  },

  // mutation
  approveDeposit: ({ amounts, isWrapped, ...rest }: ApproveDeposit) => {
    return ['approveDeposit', ...keys.signerBase(rest), amounts, isWrapped] as const
  },
  deposit: ({ amounts, isWrapped, maxSlippage, ...rest }: Deposit) => {
    return ['deposit', ...keys.signerBase(rest), amounts, isWrapped, maxSlippage] as const
  },
  depositStake: ({ amounts, isWrapped, maxSlippage, ...rest }: Deposit) => {
    return ['depositStake', ...keys.signerBase(rest), amounts, isWrapped, maxSlippage] as const
  },
  approveStake: ({ lpToken, ...rest }: Stake) => {
    return ['approveStake', ...keys.signerBase(rest), lpToken] as const
  },
  stake: ({ lpToken, ...rest }: Stake) => {
    return ['stake', ...keys.signerBase(rest), lpToken] as const
  },
}
