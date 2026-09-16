import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'

export type StellarAddress = `G${string}` // todo: rename to StellarUser
export type StellarContract = `C${string}`
export type StellarSecret = `S${string}`

/**
 * Wrapper to 'convert' Stellar address to EVM addresses (typescript only).
 * TODO: Remove this and make shared code accept either a generic or an union.
 */
export const asAddress = <T extends StellarAddress | StellarContract | null | undefined>(address: T) =>
  maybe(address, a => a as string as Address)

export const shortenAddress = <T extends StellarAddress | StellarContract | null | undefined>(address: T) =>
  maybe(address, shortenString)
