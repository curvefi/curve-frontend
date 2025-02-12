import { createValidationSuite } from '@ui-kit/lib/validation'
import { enforce, group, test } from 'vest'
import { type UserParams } from '@ui-kit/lib/model/query'

export const userValidationGroup = ({ userAddress }: UserParams) =>
  group('userValidation', () => {
    test('userAddress', () => {
      enforce(userAddress)
        .message('User address is required')
        .isNotEmpty()
        .message('Invalid user address')
        .isValiduserAddress()
    })
  })

export const userValidationSuite = createValidationSuite(userValidationGroup)
