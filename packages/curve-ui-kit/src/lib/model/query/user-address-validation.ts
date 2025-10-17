import { createValidationSuite } from '@ui-kit/lib/validation'
import { enforce, group, test } from '@ui-kit/lib/validation/lib'
import { UserParams } from './root-keys'

export const userAddressValidationGroup = <T extends string>({ userAddress }: UserParams<T>) =>
  group('userAddressValidation', () => {
    test('userAddress', 'Address is required', () => {
      enforce(userAddress).isNotEmpty()
    })

    test('userAddress', 'Invalid EVM address', () => {
      if (userAddress) {
        enforce(userAddress).isAddress()
      }
    })
  })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
