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

export const withdrawKeys = {
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
      ...withdrawKeys.base(rest),
      selected,
      lpToken,
      amounts,
      selectedTokenAddress,
      isWrapped,
      maxSlippage,
    ] as const
  },
  claimableDetails: (rest: PoolSignerBase) => {
    return ['claimableDetails', ...withdrawKeys.signerBase(rest)] as const
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
      ...withdrawKeys.signerBase(rest),
      selected,
      lpToken,
      lpTokenError,
      amounts,
      selectedTokenAddress,
      isWrapped,
    ] as const
  },
  claimEstGas: ({ claimType, claimableCrv, claimableRewards, ...rest }: Claim) => {
    return ['claimEstGas', ...withdrawKeys.signerBase(rest), claimType, claimableCrv, claimableRewards] as const
  },
  // mutation
  approveWithdraw: ({ selected, lpToken, amounts, ...rest }: ApproveWithdraw) => {
    return ['approveWithdraw', ...withdrawKeys.signerBase(rest), selected, lpToken, amounts] as const
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
      ...withdrawKeys.signerBase(rest),
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
    return ['unstakeEstGas', ...withdrawKeys.signerBase(rest), gauge, gaugeError] as const
  },
  unstake: ({ gauge, ...rest }: Unstake) => {
    return ['unstake', ...withdrawKeys.signerBase(rest), gauge] as const
  },
  claim: ({ claimType, claimableCrv, claimableRewards, ...rest }: Claim) => {
    return ['claim', ...withdrawKeys.signerBase(rest), claimType, claimableCrv, claimableRewards] as const
  },
}
