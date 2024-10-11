import { CombinedChainParams } from '../types'
import { chainValidationSuite } from '../model/validation'
import { assertValidity, checkValidity } from '@/shared/lib/validation'

export const assertChainValidity = <T extends CombinedChainParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  assertValidity(chainValidationSuite, data, fields)

export const checkChainValidity = <T extends CombinedChainParams>(data: T, fields?: Extract<keyof T, string>[]) =>
  checkValidity(chainValidationSuite, data, fields)
