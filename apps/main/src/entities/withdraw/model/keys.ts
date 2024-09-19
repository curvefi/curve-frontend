import type {
  ApproveWithdraw,
  Claim,
  PoolBase,
  PoolSignerBase,
  Withdraw,
  WithdrawEstGasApproval,
  WithdrawDetails,
  Unstake,
  UnstakeEstGas,
} from '@/entities/withdraw'

export const keys = {
  base: ({ chainId, poolId }: PoolBase) => {
    return [chainId, poolId] as const
  },
  signerBase: ({ chainId, signerAddress, poolId }: PoolSignerBase) => {
    return [chainId, signerAddress, poolId] as const
  },

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
      'withdrawDetails',
      ...keys.base(rest),
      selected,
      lpToken,
      amounts,
      selectedTokenAddress,
      isWrapped,
      maxSlippage,
    ] as const
  },
  claimableDetails: (rest: PoolSignerBase) => {
    return ['claimableDetails', ...keys.signerBase(rest)] as const
  },
  withdrawEstGasApproval: ({
    selected,
    lpToken,
    lpTokenError,
    amounts,
    selectedTokenAddress,
    isWrapped,
    ...rest
  }: WithdrawEstGasApproval) => {
    return [
      'withdrawEstGasApproval',
      ...keys.signerBase(rest),
      selected,
      lpToken,
      lpTokenError,
      amounts,
      selectedTokenAddress,
      isWrapped,
    ] as const
  },
  claimEstGas: ({ claimType, claimableCrv, claimableRewards, ...rest }: Claim) => {
    return ['claimEstGas', ...keys.signerBase(rest), claimType, claimableCrv, claimableRewards] as const
  },
  // mutation
  approveWithdraw: ({ selected, lpToken, amounts, ...rest }: ApproveWithdraw) => {
    return ['approveWithdraw', ...keys.signerBase(rest), selected, lpToken, amounts] as const
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
      'withdraw',
      ...keys.signerBase(rest),
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
    return ['unstakeEstGas', ...keys.signerBase(rest), gauge, gaugeError] as const
  },
  unstake: ({ gauge, ...rest }: Unstake) => {
    return ['unstake', ...keys.signerBase(rest), gauge] as const
  },
  claim: ({ claimType, claimableCrv, claimableRewards, ...rest }: Claim) => {
    return ['claim', ...keys.signerBase(rest), claimType, claimableCrv, claimableRewards] as const
  },
}
