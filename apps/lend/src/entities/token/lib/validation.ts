import { CombinedTokenParams, TokenQueryKeyType } from '@/entities/token'
import { assertValidity, checkValidity } from '@/shared/lib/validation'
import { tokenValidationSuite } from '@/entities/token/model/validation'

export const assertTokenValidity = <T extends CombinedTokenParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  assertValidity(tokenValidationSuite, data, fields)

export const checkTokenValidity = <T extends CombinedTokenParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  checkValidity(tokenValidationSuite, data, fields)

export const assertTokenParams = <T extends TokenQueryKeyType>([, chainId, , tokenAddress]: T) =>
  assertTokenValidity({ chainId, tokenAddress })
