import { CombinedTokenParams } from '@/entities/token'
import { tokenValidationSuite } from '@/entities/token/model/validation'
import { assertValidity, checkValidity } from '@/shared/lib/validation'

export const assertTokenValidity = <T extends CombinedTokenParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  assertValidity(tokenValidationSuite, data, fields)

export const checkTokenValidity = <T extends CombinedTokenParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  checkValidity(tokenValidationSuite, data, fields)
