import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'

type TimeOptionParams = { timeOption: TimeOption }

const validTimeOptions: TimeOption[] = ['1M', '6M', '1Y']

export const timeOptionValidationGroup = ({ timeOption }: TimeOptionParams) =>
  group('timeOptionValidation', () => {
    test('timeOption', 'Time option is required', () => {
      enforce(timeOption).isNotEmpty()
    })

    test('timeOption', 'Invalid time option', () => {
      enforce(validTimeOptions.includes(timeOption)).equals(true)
    })
  })

export const timeOptionValidationSuite = createValidationSuite(timeOptionValidationGroup)
