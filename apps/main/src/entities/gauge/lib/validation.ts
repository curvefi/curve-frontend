import { gaugeValidationSuite } from '@/entities/gauge/model'
import type { CombinedGaugeParams } from '@/entities/gauge/types'
import { assertValidity, checkValidity } from '@/shared/curve-lib'
import type { ValidatedData } from 'curve-lib/src/shared/validation/types'

export function checkGaugeValidity<T extends CombinedGaugeParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): boolean {
  return checkValidity(gaugeValidationSuite, data, fields)
}

export function assertGaugeValidity<T extends CombinedGaugeParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): ValidatedData<T> {
  return assertValidity(gaugeValidationSuite, data, fields)
}
