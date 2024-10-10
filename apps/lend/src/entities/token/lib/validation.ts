import { CombinedTokenParams } from '@/entities/token'
import { assertValidity, checkValidity, ValidatedData } from '@/shared/lib/validation'
import { tokenValidationSuite } from '@/entities/token/model/validation'

export const assertTokenValidity = <T extends CombinedTokenParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  assertValidity(tokenValidationSuite, data, fields)

export const checkTokenValidity = <T extends CombinedTokenParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  checkValidity(tokenValidationSuite, data, fields)
