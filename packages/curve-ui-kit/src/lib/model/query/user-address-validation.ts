import type { Address } from 'viem'
import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { isAddress } from 'viem'

type UserAddressParams = { userAddress: Address }

export const userAddressValidationGroup = ({ userAddress }: UserAddressParams) =>
  group('userAddressValidation', () => {
    test('userAddress', () => {
      enforce(userAddress)
        .message('Address is required')
        .isNotEmpty()
        .message('Invalid EVM address')
        .satisfy(() => isAddress(userAddress))
    })
  })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
