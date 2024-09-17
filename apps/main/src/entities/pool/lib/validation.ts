import { poolValidationSuite } from '@/entities/pool/model'
import { assertValidity, checkValidity } from '@/shared/validation/lib'
import type { ValidatedData } from '@/shared/validation/types'
import { PoolQueryParams } from '@/entities/pool'
import { ChainQueryParams } from '@/entities/chain/types'
import { chainValidationSuite } from '@/entities/chain'

export function checkPoolsValidity<T extends ChainQueryParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): boolean {
  return checkValidity(chainValidationSuite, data, fields)
}

export function assertPoolsValidity<T extends ChainQueryParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): ValidatedData<T> {
  return assertValidity(chainValidationSuite, data, fields)
}

export function checkPoolValidity<T extends PoolQueryParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): boolean {
  return checkValidity(poolValidationSuite, data, fields)
}

export function assertPoolValidity<T extends PoolQueryParams>(
  data: T,
  fields?: Extract<keyof T, string>[]
): ValidatedData<T> {
  return assertValidity(poolValidationSuite, data, fields)
}
