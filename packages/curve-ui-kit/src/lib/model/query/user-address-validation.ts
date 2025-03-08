import { enforce, group, test } from 'vest'
import { isAddress } from 'viem'
import { createValidationSuite } from '@ui-kit/lib/validation'

type UserAddressParams = { userAddress: string }

export const userAddressValidationGroup = ({ userAddress }: UserAddressParams) =>
  group('userAddressValidation', () => {
    test('userAddress', 'Address is required', () => {
      enforce(userAddress).isNotEmpty()
    })

    test('userAddress', 'Invalid EVM address', () => {
      enforce(isAddress(userAddress)).equals(true)
    })
  })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
