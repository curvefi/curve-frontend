import type { QueryFunction } from '@tanstack/react-query'
import type { Amount, ClaimableDetailsResp, WithdrawDetailsResp, WithdrawQueryKeyType } from '@/entities/withdraw'

import { isBonus, isHighSlippage, isValidAddress } from '@/utils'
import { warnIncorrectEstGas } from '@/lib/curvejs'
import useStore from '@/store/useStore'

export const withdrawDetails: QueryFunction<WithdrawDetailsResp, WithdrawQueryKeyType<'withdrawDetails'>> = async ({
  queryKey,
}) => {
  const [, chainId, , poolId, , selected, lpToken, formAmounts, selectedTokenAddress, isWrapped, maxSlippage] = queryKey

  let resp: WithdrawDetailsResp = {
    expectedAmounts: [],
    expected: '',
    bonus: '',
    slippage: null,
    isHighSlippage: false,
    isBonus: false,
    withdrawTotal: null,
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

  if (resp.expectedAmounts.length > 0) {
    resp.withdrawTotal = resp.expectedAmounts.reduce((prev, a) => {
      prev += Number(a)
      return prev
    }, 0)
  }

  return resp
}

export const claimableDetails: QueryFunction<ClaimableDetailsResp, WithdrawQueryKeyType<'claimableDetails'>> = async ({
  queryKey,
}) => {
  const [, chainId, , poolId, signerAddress] = queryKey

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

export const withdrawApproval: QueryFunction<boolean, WithdrawQueryKeyType<'withdrawApproval'>> = async ({
  queryKey,
}) => {
  const [, chainId, , poolId, , , selected, lpToken, , formAmounts] = queryKey

  let resp = false

  if (!chainId || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  if (selected === 'one-coin') {
    return await pool.withdrawOneCoinIsApproved(lpToken)
  }

  if (selected === 'balanced' || selected === 'custom-lpToken') {
    return await pool.withdrawIsApproved(lpToken)
  }

  if (selected === 'custom-amounts') {
    const amounts = parseAmountsForAPI(formAmounts)
    return await pool.withdrawImbalanceIsApproved(amounts)
  }

  return resp
}

export const withdrawEstGas: QueryFunction<EstimatedGas, WithdrawQueryKeyType<'withdrawEstGas'>> = async ({
  queryKey,
}) => {
  const [, chainId, , poolId, , , selected, isApproved, lpToken, , formAmounts, selectedTokenAddress, isWrapped] =
    queryKey

  let resp: EstimatedGas = null

  if (!chainId || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  if (selected === 'one-coin') {
    if (isApproved) {
      resp = await (isWrapped
        ? pool.estimateGas.withdrawOneCoinWrapped(lpToken, selectedTokenAddress)
        : pool.estimateGas.withdrawOneCoin(lpToken, selectedTokenAddress))
    } else {
      resp = await pool.estimateGas.withdrawOneCoinApprove(lpToken)
    }
  }

  if (selected === 'balanced' || selected === 'custom-lpToken') {
    if (isApproved) {
      resp = await (isWrapped ? pool.estimateGas.withdrawWrapped(lpToken) : pool.estimateGas.withdraw(lpToken))
    } else {
      resp = await pool.estimateGas.withdrawApprove(lpToken)
    }
  }

  if (selected === 'custom-amounts') {
    const amounts = parseAmountsForAPI(formAmounts)

    if (isApproved) {
      resp = await (isWrapped
        ? pool.estimateGas.withdrawImbalanceWrapped(amounts)
        : pool.estimateGas.withdrawImbalance(amounts))
    } else {
      resp = await pool.estimateGas.withdrawImbalanceApprove(amounts)
    }
  }
  warnIncorrectEstGas(chainId, resp)
  return resp
}

export const unstakeEstGas: QueryFunction<EstimatedGas, WithdrawQueryKeyType<'unstakeEstGas'>> = async ({
  queryKey,
}) => {
  const [, chainId, , poolId, signerAddress, , gauge] = queryKey

  let resp: EstimatedGas = null

  if (!chainId || !signerAddress || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  resp = await pool.estimateGas.unstake(gauge)
  warnIncorrectEstGas(chainId, resp)
  return resp
}

export const claimEstGas: QueryFunction<EstimatedGas, WithdrawQueryKeyType<'claimEstGas'>> = async ({ queryKey }) => {
  const [, chainId, , poolId, signerAddress, , claimType, claimableCrv, claimableRewards] = queryKey

  let resp: EstimatedGas = null

  if (!chainId || !signerAddress || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const haveClaimableCrv = Number(claimableCrv) > 0
  const haveClaimableRewards = claimableRewards.reduce((prev, { amount }) => prev + Number(amount), 0)

  resp = 0
  if (claimType === 'CLAIM_CRV' || (!claimType && haveClaimableCrv)) {
    resp = await pool.estimateGas.claimCrv()
  }

  if (claimType === 'CLAIM_REWARDS' || (!claimType && haveClaimableRewards)) {
    resp = await pool.estimateGas.claimRewards()
  }

  warnIncorrectEstGas(chainId, resp)
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
