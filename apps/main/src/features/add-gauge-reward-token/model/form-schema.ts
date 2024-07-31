import { isAddress, isAddressEqual, zeroAddress } from 'viem'
import { z } from 'zod'
import { type Address } from 'viem'

export const schema = z.object({
  rewardTokenId: z
    .custom<Address>((val) => isAddress(val as string), {
      message: 'Invalid ERC20 token address',
    })
    .refine((address) => !isAddressEqual(address, zeroAddress), {
      message: 'Reward token address cannot be zero address',
    }),
  distributorId: z
    .custom<Address>((val) => isAddress(val as string), {
      message: 'Invalid distributor address',
    })
    .refine((address) => !isAddressEqual(address, zeroAddress), {
      message: 'Distributor address cannot be zero address',
    }),
})
