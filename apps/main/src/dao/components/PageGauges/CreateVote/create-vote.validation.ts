import { test } from 'vest'
import { addressValidationFn, createValidationSuite } from '@evm-ui/lib/validation'
import { enforce } from '@evm-ui/lib/validation/enforce-extension'
import type { CreateVoteForm } from './useCreateVoteForm'

export const createVoteFormValidationSuite = createValidationSuite(
  ({ gaugeAddress, description, pinataJwt }: CreateVoteForm) => {
    test('gaugeAddress', () => addressValidationFn(gaugeAddress))
    test('description', 'Description is required', () => {
      enforce(description).isNotEmpty()
    })
    test('pinataJwt', 'Pinata JWT is required', () => {
      enforce(pinataJwt).isNotEmpty()
    })
  },
)
