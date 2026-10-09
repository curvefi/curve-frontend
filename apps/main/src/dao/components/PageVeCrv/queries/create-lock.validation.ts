import { test } from 'vest'
import { z } from 'zod/v4'
import { curveApiValidationGroup } from '@evm-ui/queries/validation/curve-api-validation'
import { userAddressValidationGroup } from '@evm-ui/queries/validation/evm-address-validation'
import { CalendarDate } from '@internationalized/date'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalGreaterThan } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { zodDecimal, createValidationSuite } from '@ui/lib/validation/lib'
import type { CreateLockFormValues, CreateLockQuery } from './create-lock.types'

const AMOUNT_REQUIRED_ERROR = t`Enter an amount to lock`
const POSITIVE_AMOUNT_ERROR = t`Enter an amount greater than zero`
const UNLOCK_DATE_ERROR = t`Select a valid unlock date`

const validateCreateLockAmount = (lockedAmount: Decimal | undefined) => {
  test('lockedAmount', AMOUNT_REQUIRED_ERROR, () => {
    enforce(lockedAmount).isNotEmpty()
  })
  test('lockedAmount', POSITIVE_AMOUNT_ERROR, () => {
    enforce(lockedAmount).isDecimal().gt(0)
  })
}

const validateCreateLockDays = (days: number) => {
  test('days', UNLOCK_DATE_ERROR, () => {
    enforce(days).gt(0)
  })
}

export const createLockFormValidationSchema: z.ZodType<CreateLockFormValues, CreateLockFormValues> = z
  .object({
    lockedAmount: zodDecimal(({ input }) =>
      input == null || input === '' ? AMOUNT_REQUIRED_ERROR : POSITIVE_AMOUNT_ERROR,
    ).refine(value => decimalGreaterThan(value, '0')),
    maxLockedAmount: zodDecimal().optional(),
    utcDate: z
      .instanceof(CalendarDate, { error: UNLOCK_DATE_ERROR })
      .nullable()
      .refine(value => value != null, { error: UNLOCK_DATE_ERROR }),
    days: z.number({ error: UNLOCK_DATE_ERROR }).positive(),
  })
  .refine(
    ({ lockedAmount, maxLockedAmount }) =>
      maxLockedAmount == null || !decimalGreaterThan(lockedAmount, maxLockedAmount),
    {
      path: ['maxLockedAmount'],
      error: ({ input }) => t`The maximum lock amount is ${(input as CreateLockFormValues).maxLockedAmount}`,
    },
  )

const validateCreateLockQueryContext = ({
  chainId,
  userAddress,
  lockedAmount,
}: Pick<CreateLockQuery, 'chainId' | 'userAddress' | 'lockedAmount'>) => {
  curveApiValidationGroup({ chainId })
  userAddressValidationGroup({ userAddress })
  validateCreateLockAmount(lockedAmount)
}

export const createLockApprovalQueryValidationSuite = createValidationSuite(
  (params: Pick<CreateLockQuery, 'chainId' | 'userAddress' | 'lockedAmount'>) => {
    validateCreateLockQueryContext(params)
  },
)

export const createLockQueryValidationSuite = createValidationSuite(({ days, ...params }: CreateLockQuery) => {
  validateCreateLockQueryContext(params)
  validateCreateLockDays(days)
})
