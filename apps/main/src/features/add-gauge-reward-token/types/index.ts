import type { Address } from 'viem'

export interface ManageGaugeProps {
  pool: PoolData
  chainId: ChainId
}

export type AddRewardTokenProps = {
  chainId: ChainId
  poolId: string
}

export type AddRewardFormValues = {
  rewardTokenId?: Address
  distributorId?: Address
}
