import { enforce, group, test } from 'vest'
import { isAddress } from 'viem'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { UserParams } from './root-keys'

export const userAddressValidationGroup = <T extends string>({ userAddress }: UserParams<T>) =>
  group('userAddressValidation', () => {
    test('userAddress', 'Address is required', () => {
      enforce(userAddress).isNotEmpty()
    })

    test('userAddress', 'Invalid EVM address', () => {
      if (userAddress) {
        enforce(isAddress(userAddress)).equals(true)
      }
    })
  })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
