import type { QueryFunction } from '@tanstack/react-query'
import type { Amount, DepositQueryKeyType, DepositDetailsResp, DepositEstGasApprovalResp } from '@/entities/deposit'

import { isBonus, isHighSlippage } from '@/utils'
import { total } from '@/entities/deposit/model/query-conditions'
import curvejsApi, { warnIncorrectEstGas } from '@/lib/curvejs'
import useStore from '@/store/useStore'

export const depositDetails: QueryFunction<DepositDetailsResp, DepositQueryKeyType<'depositDetails'>> = async ({
  queryKey,
}) => {
  const [, , , poolId, formType, isSeed, isWrapped, formAmounts, maxSlippage] = queryKey

  let resp = {
    expected: '',
    virtualPrice: '',
    slippage: 0,
    isHighSlippage: false,
    isBonus: false,
  }

  if (!poolId || isSeed === null || total(formAmounts) === 0) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const amounts = parseAmountsForAPI(formAmounts)

  const isDeposit = formType === 'DEPOSIT'
  const [expected, bonus, { parameters }] = await Promise.all(
    isWrapped
      ? isDeposit
        ? [
            pool.depositWrappedExpected(amounts),
            isSeed ? '0' : pool.depositWrappedBonus(amounts),
            curvejsApi.pool.poolParameters(pool),
          ]
        : [
            pool.depositAndStakeWrappedExpected(amounts),
            isSeed ? '0' : pool.depositAndStakeWrappedBonus(amounts),
            curvejsApi.pool.poolParameters(pool),
          ]
      : isDeposit
      ? [pool.depositExpected(amounts), isSeed ? '0' : pool.depositBonus(amounts), curvejsApi.pool.poolParameters(pool)]
      : [
          pool.depositAndStakeExpected(amounts),
          isSeed ? '0' : pool.depositAndStakeBonus(amounts),
          curvejsApi.pool.poolParameters(pool),
        ]
  )

  resp.expected = expected
  resp.virtualPrice = parameters.virtualPrice
  resp.slippage = Math.abs(+bonus)
  resp.isHighSlippage = isHighSlippage(+bonus, maxSlippage)
  resp.isBonus = isBonus(+bonus)

  return resp
}

export const depositBalancedAmounts: QueryFunction<string[], DepositQueryKeyType<'depositBalancedAmounts'>> = async ({
  queryKey,
}) => {
  const [, , , poolId, isBalancedAmounts, isWrapped] = queryKey

  let resp: string[] = []

  if (!poolId || !isBalancedAmounts) return resp

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)

  return await (isWrapped ? pool.depositWrappedBalancedAmounts() : pool.depositBalancedAmounts())
}

export const depositEstGasApproval: QueryFunction<
  DepositEstGasApprovalResp,
  DepositQueryKeyType<'depositEstGasApproval'>
> = async ({ queryKey }) => {
  const [, , chainId, , poolId, formType, formAmounts, , isWrapped] = queryKey

  let resp: DepositEstGasApprovalResp = {
    isApproved: false,
    estimatedGas: null,
  }

  if (!chainId || !poolId) return resp

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  const isDeposit = formType === 'DEPOSIT'
  const amounts = parseAmountsForAPI(formAmounts)

  resp.isApproved = await (isWrapped
    ? isDeposit
      ? pool.depositWrappedIsApproved(amounts)
      : pool.depositAndStakeWrappedIsApproved(amounts)
    : isDeposit
    ? pool.depositIsApproved(amounts)
    : pool.depositAndStakeIsApproved(amounts))

  if (resp.isApproved) {
    resp.estimatedGas = await (isWrapped
      ? isDeposit
        ? pool.estimateGas.depositWrapped(amounts)
        : pool.estimateGas.depositAndStakeWrapped(amounts)
      : isDeposit
      ? pool.estimateGas.deposit(amounts)
      : pool.estimateGas.depositAndStake(amounts))
  }

  if (!resp.isApproved) {
    resp.estimatedGas = await (isWrapped
      ? isDeposit
        ? pool.estimateGas.depositWrappedApprove(amounts)
        : pool.estimateGas.depositAndStakeWrappedApprove(amounts)
      : isDeposit
      ? pool.estimateGas.depositApprove(amounts)
      : pool.estimateGas.depositAndStakeApprove(amounts))
  }
  warnIncorrectEstGas(chainId, resp.estimatedGas)
  return resp
}

export const stakeEstGasApproval: QueryFunction<
  DepositEstGasApprovalResp,
  DepositQueryKeyType<'stakeEstGasApproval'>
> = async ({ queryKey }) => {
  const [, , chainId, , poolId, lpToken] = queryKey

  let resp: DepositEstGasApprovalResp = {
    isApproved: false,
    estimatedGas: null,
  }

  if (!chainId || !poolId) return resp

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)

  resp.isApproved = await pool.stakeIsApproved(lpToken)
  resp.estimatedGas = resp.isApproved
    ? await pool.estimateGas.stake(lpToken)
    : await pool.estimateGas.stakeApprove(lpToken)
  warnIncorrectEstGas(chainId, resp.estimatedGas)
  return resp
}

// helpers
function parseAmountsForAPI(amounts: Amount[]) {
  return amounts.map((a) => (Number(a.value) > 0 ? a.value : '0'))
}
