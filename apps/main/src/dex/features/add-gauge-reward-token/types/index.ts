import { ChainId } from '@/dex/types/main.types'
import type { Address } from '@primitives/address.utils'

export type AddRewardTokenProps = {
  chainId: ChainId
  poolId: string
}

export type AddRewardFormValues = {
  rewardTokenId?: Address
  distributorId?: Address
}
