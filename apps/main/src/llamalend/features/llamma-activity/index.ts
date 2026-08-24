import type { Chain } from '@curvefi/prices-api'
import type { Endpoint } from '@curvefi/prices-api/llamma'
import { type BaseConfig } from '@legacy-ui/utils'
import type { Address, Token } from '@primitives/address.utils'

export { LlammaActivityEvents } from './LlammaActivityEvents'
export { LlammaActivityTrades } from './LlammaActivityTrades'

export type LlammaActivityProps = {
  network: Chain | undefined
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: Address | undefined
  endpoint: Endpoint
  networkConfig: BaseConfig | undefined
}
