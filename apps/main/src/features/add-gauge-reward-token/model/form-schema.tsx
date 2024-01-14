import { isAddress } from 'viem'
import { z } from 'zod'

export const schema = z.object({
  rewardToken: z.string().refine((address) => isAddress(address), {
    message: 'Invalid ERC20 token address',
  }),
  distributor: z.string().refine((address) => isAddress(address), {
    message: 'Invalid distributor address',
  }),
})
