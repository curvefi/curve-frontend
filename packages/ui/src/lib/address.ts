import type { Address } from '@primitives/address.utils'

/** Presentation callbacks for addresses already normalized by the caller. */
export type AddressDisplay = {
  shortenAddress: (address: Address) => string
  scanAddressPath: (chainId: number, address: Address) => string | undefined
}
