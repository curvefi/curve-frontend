import { chainValidationSuite } from '@/entities/chain/model'
import { assertValidity, checkValidity } from '@/shared/validation/lib'
import type { ValidatedData } from '@/shared/validation/types'
import { ChainQueryParams } from '@/entities/chain/types'

export function checkChainValidity<T extends ChainQueryParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): boolean {
  return checkValidity(chainValidationSuite, data, fields)
}

export function assertChainValidity<T extends ChainQueryParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): ValidatedData<T> {
  return assertValidity(chainValidationSuite, data, fields)
}
