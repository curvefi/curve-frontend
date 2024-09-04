import { poolValidationSuite } from '@/entities/pool/model'
import { CombinedPoolParams, PoolQueryKeyType } from '@/entities/pool/types'
import { assertValidity, checkValidity } from '@/shared/validation/lib'
import type { ValidatedData } from '@/shared/validation/types'

export function checkPoolValidity<T extends CombinedPoolParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): boolean {
  return checkValidity(poolValidationSuite, data, fields)
}

export function assertPoolValidity<T extends CombinedPoolParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): ValidatedData<T> {
  return assertValidity(poolValidationSuite, data, fields)
}
