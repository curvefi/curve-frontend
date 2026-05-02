import { enforce, test } from 'vest'
import { addressValidationFn, createValidationSuite } from '@ui-kit/lib/validation'
import type { CreateVoteForm } from './useCreateVoteForm'

export const createVoteFormValidationSuite = createValidationSuite(({ gaugeAddress, description }: CreateVoteForm) => {
  test('gaugeAddress', () => addressValidationFn(gaugeAddress))
  test('description', 'Description is required', () => {
    enforce(description).isNotEmpty()
  })
})
