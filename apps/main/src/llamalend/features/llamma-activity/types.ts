import type { Chain } from '@curvefi/prices-api'
import type { Endpoint } from '@curvefi/prices-api/llamma'
import type { Address, Token } from '@primitives/address.utils'
import type { IconToken } from '@ui/components/TokenIcon'

export type LlammaActivityProps = {
  chainId: number
  blockchainId: Chain
  collateralToken: (Token & IconToken) | undefined
  borrowToken: (Token & IconToken) | undefined
  ammAddress: Address | undefined
  endpoint: Endpoint
}
