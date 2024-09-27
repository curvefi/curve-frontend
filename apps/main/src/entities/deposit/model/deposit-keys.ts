import { poolKeys } from '@/entities/pool'
import type {
  ApproveDeposit,
  Deposit,
  DepositBalancedAmounts,
  DepositDetails,
  DepositApproval,
  DepositEstGas,
  DepositSeedAmounts,
} from '@/entities/deposit'

export const depositKeys = {
  // query
  depositSeedAmounts: ({ isSeed, isCrypto, isMeta, firstAmount, ...rest }: DepositSeedAmounts) => {
    return [...poolKeys.root(rest), 'depositSeedAmounts', isSeed, isCrypto, isMeta, firstAmount] as const
  },
  depositBalancedAmounts: ({ isBalancedAmounts, isWrapped, ...rest }: DepositBalancedAmounts) => {
    return [...poolKeys.root(rest), 'depositBalancedAmounts', isBalancedAmounts, isWrapped] as const
  },
  depositDetails: ({ formType, isSeed, amounts, isWrapped, maxSlippage, ...rest }: DepositDetails) => {
    return [...poolKeys.root(rest), 'depositDetails', formType, isSeed, isWrapped, amounts, maxSlippage] as const
  },
  depositApproval: ({ formType, amounts, amountsError, isWrapped, ...rest }: DepositApproval) => {
    return [...poolKeys.signerBase(rest), 'depositApproval', formType, amounts, amountsError, isWrapped] as const
  },
  depositEstGas: ({ formType, isApproved, amounts, amountsError, isWrapped, ...rest }: DepositEstGas) => {
    return [
      ...poolKeys.signerBase(rest),
      'depositEstGas',
      isApproved,
      formType,
      amounts,
      amountsError,
      isWrapped,
    ] as const
  },

  // mutation
  approveDeposit: ({ amounts, isWrapped, ...rest }: ApproveDeposit) => {
    return [...poolKeys.signerBase(rest), 'approveDeposit', amounts, isWrapped] as const
  },
  deposit: ({ amounts, isWrapped, maxSlippage, ...rest }: Deposit) => {
    return [...poolKeys.signerBase(rest), 'deposit', amounts, isWrapped, maxSlippage] as const
  },
  depositStake: ({ amounts, isWrapped, maxSlippage, ...rest }: Deposit) => {
    return [...poolKeys.signerBase(rest), 'depositStake', amounts, isWrapped, maxSlippage] as const
  },
}
