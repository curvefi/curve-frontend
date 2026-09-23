import { STELLAR_NETWORKS_BY_ID } from '@/stellar/lib/networks'
import type { Address } from '@primitives/address.utils'
import { maybe, type Nullish } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'

export type StellarAddress = `G${string}` // todo: rename to StellarUser
export type StellarContract = `C${string}`
export type StellarSecret = `S${string}`

/**
 * Wrapper to 'convert' Stellar address to EVM addresses (typescript only).
 * TODO: Remove this and make shared code accept either a generic or an union.
 */
export const asAddress = <T extends StellarAddress | StellarContract | Nullish>(address: T) =>
  maybe(address, a => a as string as Address)

/** Restores the Stellar contract type after crossing a shared EVM-address UI boundary. */
export const asStellarContract = <T extends Address | Nullish>(address: T) =>
  maybe(address, a => a as string as StellarContract)

export const shortenAddress = <T extends StellarAddress | StellarContract | Nullish>(address: T) =>
  maybe(address, shortenString)

export const stellarAddressDisplay = {
  formatAddress: (address: Address) => shortenAddress(asStellarContract(address)),
  scanAddressPath: (chainId: number, address: Address) =>
    `${STELLAR_NETWORKS_BY_ID[chainId as keyof typeof STELLAR_NETWORKS_BY_ID].explorerUrl.replace(/\/$/, '')}/contract/${address}`,
}
