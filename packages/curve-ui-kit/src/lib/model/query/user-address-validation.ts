import { group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import type { UserAddressParams } from '@ui-kit/lib/model'

export const userAddressValidationGroup = ({ userAddress }: UserAddressParams) =>
  group('userAddressValidation', () => {
    test('userAddress', () => {
      // enforce(userAddress)
      //   .message('Address is required')
      //   .isNotEmpty()
      //   .message('Invalid EVM address')
      //   .satisfy(() => isAddress(userAddress!))
    })
  })

export const userAddressValidationSuite = createValidationSuite(userAddressValidationGroup)
