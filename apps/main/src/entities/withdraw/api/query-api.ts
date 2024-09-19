import type { QueryFunction } from '@tanstack/react-query'
import type {
  Amount,
  ClaimableDetailsResp,
  WithdrawDetailsResp,
  WithdrawEstGasApprovalResp,
  WithdrawQueryKeyType,
} from '@/entities/withdraw'

import { isBonus, isHighSlippage, isValidAddress } from '@/utils'
import { warnIncorrectEstGas } from '@/lib/curvejs'
import useStore from '@/store/useStore'

export const withdrawDetails: QueryFunction<WithdrawDetailsResp, WithdrawQueryKeyType<'withdrawDetails'>> = async ({
  queryKey,
}) => {
  const [, , poolId, selected, lpToken, formAmounts, selectedTokenAddress, isWrapped, maxSlippage] = queryKey

  let resp: WithdrawDetailsResp = {
    expectedAmounts: [],
    expected: '',
    bonus: '',
    slippage: null,
    isHighSlippage: false,
    isBonus: false,
  }

  if (!poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  if (selected === 'one-coin') {
    const [expected, bonus] = await Promise.all([
      isWrapped
        ? pool.withdrawOneCoinWrappedExpected(lpToken, selectedTokenAddress)
        : pool.withdrawOneCoinExpected(lpToken, selectedTokenAddress),
      isWrapped
        ? pool.withdrawOneCoinWrappedBonus(lpToken, selectedTokenAddress)
        : pool.withdrawOneCoinBonus(lpToken, selectedTokenAddress),
    ])
    resp.expected = expected
    resp.bonus = bonus
  }

  if (selected === 'balanced' || selected === 'custom-lpToken') {
    resp.expectedAmounts = await (isWrapped ? pool.withdrawWrappedExpected(lpToken) : pool.withdrawExpected(lpToken))
    resp.slippage = 0 // balanced withdraw will have 0 slippage
  }

  if (selected === 'custom-amounts') {
    const amounts = parseAmountsForAPI(formAmounts)
    const [expected, bonus] = await Promise.all([
      isWrapped ? await pool.withdrawImbalanceWrappedExpected(amounts) : await pool.withdrawImbalanceExpected(amounts),
      isWrapped ? await pool.withdrawImbalanceWrappedBonus(amounts) : await pool.withdrawImbalanceBonus(amounts),
    ])
    resp.expected = expected
    resp.bonus = bonus
  }

  if (resp.bonus !== '') {
    resp.slippage = Math.abs(+resp.bonus)
    resp.isHighSlippage = isHighSlippage(+resp.bonus, maxSlippage)
    resp.isBonus = isBonus(+resp.bonus)
  }

  return resp
}

export const claimableDetails: QueryFunction<ClaimableDetailsResp, WithdrawQueryKeyType<'claimableDetails'>> = async ({
  queryKey,
}) => {
  const [, chainId, signerAddress, poolId] = queryKey

  let resp: ClaimableDetailsResp = { claimableCrv: '', claimableRewards: [] }

  if (!chainId || !poolId || !signerAddress) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  if (!isValidAddress(pool.gauge.address)) return resp

  const isRewardsOnly = pool.rewardsOnly()

  if (isRewardsOnly) {
    resp.claimableRewards = await fetchClaimableRewards(chainId, pool)
  } else {
    const [claimableRewards, claimableCRV] = await Promise.all([
      fetchClaimableRewards(chainId, pool),
      fetchClaimableCrv(pool),
    ])
    resp.claimableRewards = claimableRewards
    resp.claimableCrv = claimableCRV
  }
  return resp
}

export const withdrawEstGasApproval: QueryFunction<
  WithdrawEstGasApprovalResp,
  WithdrawQueryKeyType<'withdrawEstGasApproval'>
> = async ({ queryKey }) => {
  const [, chainId, , poolId, selected, lpToken, , formAmounts, selectedTokenAddress, isWrapped] = queryKey

  let resp: WithdrawEstGasApprovalResp = { isApproved: false, estimatedGas: null }

  if (!chainId || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  if (selected === 'one-coin') {
    resp.isApproved = await pool.withdrawOneCoinIsApproved(lpToken)
    if (resp.isApproved) {
      resp.estimatedGas = await (isWrapped
        ? pool.estimateGas.withdrawOneCoinWrapped(lpToken, selectedTokenAddress)
        : pool.estimateGas.withdrawOneCoin(lpToken, selectedTokenAddress))
    } else {
      resp.estimatedGas = await pool.estimateGas.withdrawOneCoinApprove(lpToken)
    }
  }

  if (selected === 'balanced' || selected === 'custom-lpToken') {
    resp.isApproved = await pool.withdrawIsApproved(lpToken)

    if (resp.isApproved) {
      resp.estimatedGas = await (isWrapped
        ? pool.estimateGas.withdrawWrapped(lpToken)
        : pool.estimateGas.withdraw(lpToken))
    } else {
      resp.estimatedGas = await pool.estimateGas.withdrawApprove(lpToken)
    }
  }

  if (selected === 'custom-amounts') {
    const amounts = parseAmountsForAPI(formAmounts)
    resp.isApproved = await pool.withdrawImbalanceIsApproved(amounts)

    if (resp.isApproved) {
      resp.estimatedGas = await (isWrapped
        ? pool.estimateGas.withdrawImbalanceWrapped(amounts)
        : pool.estimateGas.withdrawImbalance(amounts))
    } else {
      resp.estimatedGas = await pool.estimateGas.withdrawImbalanceApprove(amounts)
    }
  }

  warnIncorrectEstGas(chainId, resp.estimatedGas)
  return resp
}

export const unstakeEstGas: QueryFunction<WithdrawEstGasApprovalResp, WithdrawQueryKeyType<'unstakeEstGas'>> = async ({
  queryKey,
}) => {
  const [, chainId, signerAddress, poolId, gauge] = queryKey

  let resp: WithdrawEstGasApprovalResp = { isApproved: true, estimatedGas: null }

  if (!chainId || !signerAddress || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  resp.estimatedGas = await pool.estimateGas.unstake(gauge)
  warnIncorrectEstGas(chainId, resp.estimatedGas)
  return resp
}

export const claimEstGas: QueryFunction<WithdrawEstGasApprovalResp, WithdrawQueryKeyType<'claimEstGas'>> = async ({
  queryKey,
}) => {
  const [, chainId, signerAddress, poolId, claimType, claimableCrv, claimableRewards] = queryKey

  let resp: WithdrawEstGasApprovalResp = { isApproved: true, estimatedGas: null }

  if (!chainId || !signerAddress || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const haveClaimableCrv = Number(claimableCrv) > 0
  const haveClaimableRewards = claimableRewards.reduce((prev, { amount }) => {
    prev += Number(amount)
    return prev
  }, 0)

  resp.estimatedGas = 0
  if (claimType === 'CLAIM_CRV' || (!claimType && haveClaimableCrv)) {
    resp.estimatedGas = await pool.estimateGas.claimCrv()
  }

  if (claimType === 'CLAIM_REWARDS' || (!claimType && haveClaimableRewards)) {
    resp.estimatedGas = await pool.estimateGas.claimRewards()
  }

  warnIncorrectEstGas(chainId, resp.estimatedGas)
  return resp
}

// helpers
function parseAmountsForAPI(amounts: Amount[]) {
  return amounts.map((a) => (Number(a.value) > 0 ? a.value : '0'))
}

async function fetchClaimableCrv(pool: Pool) {
  const claimableCrv = await pool.claimableCrv()

  if (claimableCrv && Number(claimableCrv) > 0) return claimableCrv
  return ''
}

async function fetchClaimableRewards(chainId: ChainId, pool: Pool) {
  const claimableRewards = await pool.claimableRewards()

  // ClaimableReward[] = [{token: '0x5a98fcbea516cf06857215779fd812ca3bef1b32', symbol: 'LDO', amount: '15.589367306902830498'}]
  return claimableRewards.filter(({ symbol, amount }) => {
    if (chainId !== 1) return symbol !== 'CRV' && +amount > 0
    return Number(amount) > 0
  })
}
