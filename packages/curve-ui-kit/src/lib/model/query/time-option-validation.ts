import { enforce, group, test } from 'vest'
import { createValidationSuite } from '@ui-kit/lib/validation'

export const timeOptions = ['1M', '6M', '1Y'] as const
export type TimeOption = (typeof timeOptions)[number]

/** Discriminated union for snapshot query range: either a UI time range or a fixed row count */
export type SnapshotRange = { kind: 'timeRange'; timeOption: TimeOption } | { kind: 'limit'; limit: number }

type TimeOptionParams = { timeOption: TimeOption }

const timeOptionValidationGroup = ({ timeOption }: TimeOptionParams) =>
  group('timeOptionValidation', () => {
    test('timeOption', 'Time option is required', () => {
      enforce(timeOption).isNotEmpty()
    })

    test('timeOption', 'Invalid time option', () => {
      enforce(timeOptions.includes(timeOption)).equals(true)
    })
  })

export const timeOptionValidationSuite = createValidationSuite(timeOptionValidationGroup)
