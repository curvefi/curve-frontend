import type { Chain } from '@curvefi/prices-api'
import type { Endpoint } from '@curvefi/prices-api/llamma'
import type { Address, Token } from '@primitives/address.utils'
import { type BaseConfig } from '@ui/utils'

export { LlammaActivityEvents } from './LlammaActivityEvents'
export { LlammaActivityTrades } from './LlammaActivityTrades'
export { useLlammaActivityEventsConfig } from './hooks/useLlammaActivityEventsConfig'
export { useLlammaActivityTradesConfig } from './hooks/useLlammaActivityTradesConfig'

export type LlammaActivityProps = {
  isMarketAvailable: boolean
  network: Chain | undefined
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: Address | undefined
  endpoint: Endpoint
  networkConfig: BaseConfig | undefined
}
