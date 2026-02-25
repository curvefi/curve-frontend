import { enforce, group, skipWhen, test } from 'vest'
import { isAddress } from 'viem'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { UserParams } from './root-keys'

export const userAddressValidationGroup = <T extends string>({
  userAddress,
  required = true,
}: UserParams<T> & { required?: boolean }) =>
  group('userAddressValidation', () => {
    skipWhen(
      () => !required && !userAddress,
      () => {
        test('userAddress', 'Address is required', () => {
          enforce(userAddress).isNotEmpty()
        })

        test('userAddress', 'Invalid EVM address', () => {
          if (userAddress) {
            enforce(isAddress(userAddress)).equals(true)
          }
        })
      },
    )
  })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
