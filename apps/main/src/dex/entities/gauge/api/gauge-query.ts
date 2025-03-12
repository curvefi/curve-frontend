import { type Address, zeroAddress } from 'viem'
import { DepositRewardApproveQuery } from '@/dex/entities/gauge/types'
import useStore from '@/dex/store/useStore'
import { GaugeQuery } from '@ui-kit/lib/model/query'
import { BD } from '@ui-kit/utils'

export const queryGaugeManager = async ({ poolId }: GaugeQuery): Promise<Address | null> => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const gaugeManager = (await pool.gauge.gaugeManager()) as Address | null
  if (!gaugeManager || gaugeManager === zeroAddress) {
    return null
  }
  return gaugeManager
}

export const queryGaugeDistributors = async ({ poolId }: GaugeQuery) => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  return pool.gauge.gaugeDistributors()
}

export const queryIsDepositRewardAvailable = async ({ poolId }: GaugeQuery) => {
  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)
  return pool.gauge.isDepositRewardAvailable()
}

export const queryDepositRewardIsApproved = async ({ poolId, amount, rewardTokenId }: DepositRewardApproveQuery) => {
  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)
  const strAmount = BD.from(amount).toString()
  return pool.gauge.depositRewardIsApproved(rewardTokenId, strAmount)
}
