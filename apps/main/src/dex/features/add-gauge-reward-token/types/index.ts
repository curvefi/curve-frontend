import type { Address } from 'viem'
import { ChainId } from '@/dex/types/main.types'

export type AddRewardTokenProps = {
  chainId: ChainId
  poolId: string
}

export type AddRewardFormValues = {
  rewardTokenId?: Address
  distributorId?: Address
}
