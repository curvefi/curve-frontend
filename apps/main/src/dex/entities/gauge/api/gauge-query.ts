import { type Address, zeroAddress } from 'viem'
import { DepositRewardApproveQuery } from '@/dex/entities/gauge/types'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { GaugeQuery } from '@ui-kit/lib/model/query'
import { BD } from '@ui-kit/utils'

export const queryGaugeManager = async ({ poolId }: GaugeQuery): Promise<Address | null> => {
  const gaugeManager = (await getGauge(poolId).gaugeManager()) as Address | null
  return gaugeManager === zeroAddress ? null : gaugeManager
}

export const getGauge = (poolId: string) => requireLib('curveApi').getPool(poolId).gauge

export const queryGaugeDistributors = async ({ poolId }: GaugeQuery) => getGauge(poolId).gaugeDistributors()

export const queryIsDepositRewardAvailable = async ({ poolId }: GaugeQuery) =>
  getGauge(poolId).isDepositRewardAvailable()

export const queryDepositRewardIsApproved = async ({ poolId, amount, rewardTokenId }: DepositRewardApproveQuery) =>
  getGauge(poolId).depositRewardIsApproved(rewardTokenId, BD.from(amount).toString())
