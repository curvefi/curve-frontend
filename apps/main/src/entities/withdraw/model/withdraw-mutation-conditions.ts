import type {
  ApproveWithdraw,
  Claim,
  MutateBase,
  PoolSignerBase,
  Withdraw,
  WithdrawFormValues,
  Unstake,
  UnstakeFormValues,
} from '@/entities/withdraw'

import { total } from '@/entities/withdraw'
import { isAddress } from 'viem'

function enableBase({
  chainId,
  poolId,
  signerAddress = '',
  isLoadingDetails,
}: PoolSignerBase & Omit<MutateBase, 'isApproved'>) {
  return !!chainId && !!poolId && isAddress(signerAddress) && !isLoadingDetails
}

function getLpTokenValidity({ lpToken, lpTokenError }: Pick<WithdrawFormValues, 'lpToken' | 'lpTokenError'>) {
  const error = lpTokenError ? new Error('Not enough LP Tokens.') : null
  return {
    enabled: Number(lpToken) > 0 && !error,
    error,
  }
}

export const enableApproveWithdraw = ({ isApproved, selected, amounts, selectedToken, ...params }: ApproveWithdraw) => {
  const lpTokenValidity = getLpTokenValidity(params)
  const enabledBase = enableBase(params) && !isApproved && lpTokenValidity.enabled

  if (selected === 'one-coin') return { enabled: enabledBase && !!selectedToken, error: lpTokenValidity.error }
  if (selected === 'balanced') return { enabled: enabledBase, error: lpTokenValidity.error }
  if (selected === 'custom-lpToken') return { enabled: enabledBase, error: lpTokenValidity.error }
  if (selected === 'custom-amounts') return { enabled: enabledBase && total(amounts) > 0, error: lpTokenValidity.error }
  return { enabled: false, error: null }
}

export const enableWithdraw = ({
  isApproved,
  selected,
  amounts,
  selectedTokenAddress,
  maxSlippage,
  ...params
}: Withdraw) => {
  const lpTokenValidity = getLpTokenValidity(params)
  const enabledBase = enableBase(params) && isApproved && lpTokenValidity.enabled
  const validSlippage = Number(maxSlippage) > 0

  if (selected === 'one-coin')
    return { enabled: enabledBase && !!selectedTokenAddress && validSlippage, error: lpTokenValidity.error }
  if (selected === 'balanced') return { enabled: enabledBase, error: lpTokenValidity.error }
  if (selected === 'custom-lpToken') return { enabled: enabledBase && validSlippage, error: lpTokenValidity.error }
  if (selected === 'custom-amounts')
    return { enabled: enabledBase && total(amounts) > 0 && validSlippage, error: lpTokenValidity.error }
  return { enabled: false, error: null }
}

function getGaugeValidity({ gauge, gaugeError }: Pick<UnstakeFormValues, 'gauge' | 'gaugeError'>) {
  return {
    enabled: Number(gauge) > 0,
    error: gaugeError ? new Error('Not enough LP Tokens.') : null,
  }
}

export const enableUnstake = ({ isApproved, ...params }: Unstake) => {
  const lpTokenValidity = getGaugeValidity(params)
  const error = lpTokenValidity.error

  return {
    enabled: enableBase(params) && lpTokenValidity.enabled && isApproved && !error,
    error,
  }
}

export const enableClaim = ({ claimableCrv, claimableRewards, ...params }: Claim) => {
  const validClaimCrv = Number(claimableCrv) > 0
  const validClaimRewards =
    claimableRewards.reduce((prev, { amount }) => {
      prev += Number(amount)
      return prev
    }, 0) > 0

  return {
    enabled: enableBase(params) && (validClaimCrv || validClaimRewards),
    error: null,
  }
}
