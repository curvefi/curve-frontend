import type { z } from 'zod'
import type { schema } from '../model/form-schema'

export interface ManageGaugeProps {
  pool: PoolData
  chainId: ChainId
}

export type AddRewardTokenProps = {
  chainId: ChainId
  poolId: string
  walletAddress: string
}

export type FormValues = z.infer<typeof schema>
