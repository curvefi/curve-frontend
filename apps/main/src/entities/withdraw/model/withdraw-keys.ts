import type {
  ApproveWithdraw,
  Claim,
  Withdraw,
  WithdrawApproval,
  WithdrawEstGas,
  WithdrawDetails,
  Unstake,
  UnstakeEstGas,
} from '@/entities/withdraw'
import type { PoolSignerBase } from '@/entities/pool'

import { poolKeys } from '@/entities/pool'

export const withdrawKeys = {
  // query
  withdrawDetails: ({
    selected,
    lpToken,
    amounts,
    selectedTokenAddress,
    isWrapped,
    maxSlippage,
    ...rest
  }: WithdrawDetails) => {
    return [
      ...poolKeys.root(rest),
      'withdrawDetails',
      selected,
      lpToken,
      amounts,
      selectedTokenAddress,
      isWrapped,
      maxSlippage,
    ] as const
  },
  claimableDetails: (rest: PoolSignerBase) => {
    return [...poolKeys.signerBase(rest), 'claimableDetails'] as const
  },
  withdrawApproval: ({ selected, lpToken, lpTokenError, amounts, ...rest }: WithdrawApproval) => {
    return [...poolKeys.signerBase(rest), 'withdrawApproval', selected, lpToken, lpTokenError, amounts] as const
  },
  withdrawEstGas: ({
    selected,
    isApproved,
    lpToken,
    lpTokenError,
    amounts,
    selectedTokenAddress,
    isWrapped,
    ...rest
  }: WithdrawEstGas) => {
    return [
      ...poolKeys.signerBase(rest),
      'withdrawEstGas',
      selected,
      isApproved,
      lpToken,
      lpTokenError,
      amounts,
      selectedTokenAddress,
      isWrapped,
    ] as const
  },
  claimEstGas: ({ claimType, claimableCrv, claimableRewards, ...rest }: Claim) => {
    return [...poolKeys.signerBase(rest), 'claimEstGas', claimType, claimableCrv, claimableRewards] as const
  },
  // mutation
  approveWithdraw: ({ selected, lpToken, amounts, ...rest }: ApproveWithdraw) => {
    return [...poolKeys.signerBase(rest), 'approveWithdraw', selected, lpToken, amounts] as const
  },
  withdraw: ({
    selected,
    lpToken,
    lpTokenError,
    amounts,
    selectedTokenAddress,
    isWrapped,
    maxSlippage,
    ...rest
  }: Withdraw) => {
    return [
      ...poolKeys.signerBase(rest),
      'withdraw',
      selected,
      lpToken,
      lpTokenError,
      amounts,
      selectedTokenAddress,
      isWrapped,
      maxSlippage,
    ] as const
  },
  unstakeEstGas: ({ gauge, gaugeError, ...rest }: UnstakeEstGas) => {
    return [...poolKeys.signerBase(rest), 'unstakeEstGas', gauge, gaugeError] as const
  },
  unstake: ({ gauge, ...rest }: Unstake) => {
    return [...poolKeys.signerBase(rest), 'unstake', gauge] as const
  },
  claim: ({ claimType, claimableCrv, claimableRewards, ...rest }: Claim) => {
    return [...poolKeys.signerBase(rest), 'claim', claimType, claimableCrv, claimableRewards] as const
  },
}
