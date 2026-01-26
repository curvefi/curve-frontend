import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const timeOptions = ['1M', '6M', '1Y'] as const
export type TimeOption = (typeof timeOptions)[number]

type TimeOptionParams = { timeOption: TimeOption }

export const timeOptionValidationGroup = ({ timeOption }: TimeOptionParams) =>
  group('timeOptionValidation', () => {
    test('timeOption', 'Time option is required', () => {
      enforce(timeOption).isNotEmpty()
    })

    test('timeOption', 'Invalid time option', () => {
      enforce(timeOptions.includes(timeOption)).equals(true)
    })
  })

export const timeOptionValidationSuite = createValidationSuite(timeOptionValidationGroup)
