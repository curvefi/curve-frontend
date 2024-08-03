import { isAddress, isAddressEqual, parseEther, zeroAddress } from 'viem'
import { z } from 'zod'
import { DepositRewardStep } from '@/features/deposit-gauge-reward/types'
import { type Address } from 'viem'

export const schema = z.object({
  rewardTokenId: z
    .custom<Address>((val) => isAddress(val as string), {
      message: 'Invalid ERC20 token address',
    })
    .refine((address) => !isAddressEqual(address, zeroAddress), {
      message: 'Address cannot be zero address',
    }),
  amount: z
    .string()
    .min(1, { message: 'Reward amount is required' })
    .refine(
      (value) => {
        try {
          parseEther(value)
          return true
        } catch {
          return false
        }
      },
      {
        message: 'Invalid number format. Please enter a valid number with up to 18 decimal places',
      }
    )
    .refine(
      (value) => {
        const parsedValue = parseEther(value)
        return parsedValue > 0n
      },
      {
        message: 'Reward amount must be greater than zero',
      }
    ),
  epoch: z.number().int('Epoch must be an integer').nonnegative('Epoch must be a non-negative number'),
  step: z.nativeEnum(DepositRewardStep, {
    errorMap: () => ({ message: 'Invalid deposit reward step' }),
  }),
})
