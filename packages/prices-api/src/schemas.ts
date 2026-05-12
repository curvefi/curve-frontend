import { z } from 'zod/v4'
import type { Address, Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { TimestampResponse } from './timestamp'
import { chains } from './index'

export const address = z.string().transform(value => value as Address)
export const chain = z.enum(chains)
export const decimal = z.string().transform(value => value as Decimal)
export const hex = z.string().transform(value => value as Hex)
export const timestampResponse = z.union([z.number(), z.string()]).transform(value => value as TimestampResponse)
