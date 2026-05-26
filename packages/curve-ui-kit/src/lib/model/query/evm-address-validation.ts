import { enforce, group, skipWhen, test } from 'vest'
import { isAddress } from 'viem'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const evmAddressValidationGroup = <T extends string>({
  evmAddress,
  required = true,
}: {
  evmAddress?: T | null
  required?: boolean
}) =>
  group('evmAddressValidation', () => {
    skipWhen(
      () => !required && !evmAddress,
      () => {
        test('evmAddress', 'Address is required', () => {
          enforce(evmAddress).isNotEmpty()
        })

        test('evmAddress', 'Invalid EVM address', () => {
          if (evmAddress) {
            enforce(isAddress(evmAddress)).equals(true)
          }
        })
      },
    )
  })

export const evmAddressValidationSuite = createValidationSuite(evmAddressValidationGroup)
