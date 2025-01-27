import type { Address } from 'viem'
import { ChainId, PoolData } from '@/dex/types/main.types'

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
