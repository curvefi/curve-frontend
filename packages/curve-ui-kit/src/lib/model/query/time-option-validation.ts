import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'

type TimeOptionParams = { timeOption: TimeOption }

const validTimeOptions: TimeOption[] = ['1M', '6M', '1Y']

export const timeOptionValidationGroup = ({ timeOption }: TimeOptionParams) =>
  group('timeOptionValidation', () => {
    test('timeOption', () => {
      enforce(timeOption)
        .message('Time option is required')
        .isNotEmpty()
        .message('Invalid time option')
        .satisfy(() => validTimeOptions.includes(timeOption as TimeOption))
    })
  })

export const timeOptionValidationSuite = createValidationSuite(timeOptionValidationGroup)
