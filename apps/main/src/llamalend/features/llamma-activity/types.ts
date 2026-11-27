import type { Chain } from '@curvefi/prices-api'
import type { Endpoint } from '@curvefi/prices-api/llamma'
import type { Address, Token } from '@primitives/address.utils'
import type { QueryProp } from '@ui/features/queries/util'

export type LlammaActivityProps = {
  chainId: number
  blockchainId: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: QueryProp<Address>
  endpoint: Endpoint
}
