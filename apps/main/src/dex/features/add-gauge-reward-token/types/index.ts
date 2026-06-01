import { ChainId } from '@/dex/types/main.types'
import type { Address } from '@primitives/address.utils'

export interface AddRewardTokenProps {
  chainId: ChainId
  poolId: string
}

export interface AddRewardFormValues {
  rewardTokenId?: Address
  distributorId?: Address
}
