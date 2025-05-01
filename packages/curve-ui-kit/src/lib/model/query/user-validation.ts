import { enforce, group, test } from 'vest'
import { type UserParams } from '@ui-kit/lib/model/query'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const userValidationGroup = <T extends string>({ userAddress }: UserParams<T>) =>
  group('userValidation', () => {
    test('userAddress', () => {
      enforce(userAddress).message('User address is required').isNotEmpty().message('Invalid user address').isAddress()
    })
  })

export const userValidationSuite = createValidationSuite(userValidationGroup)
