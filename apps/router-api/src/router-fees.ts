import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { Chain } from '@primitives/network.utils'

export const ROUTER_FEE_BPS: Decimal = '8' // note: no fractions allowed by enso

export const ROUTER_FEE_RECEIVER_BY_CHAIN_ID: Record<number, Address> = {
  [Chain.Ethereum]: '0xB4c2C0B045fA0517cACEebC917443Fa041A9c18B',
  [Chain.Optimism]: '0x3Aa9742e8BA5eA0F573FcE69e1c8b49aFd0Af610',
}
