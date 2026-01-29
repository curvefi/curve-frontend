import type { Chain, Address } from '@curvefi/prices-api'
import type { Endpoint } from '@curvefi/prices-api/llamma'
import { type BaseConfig } from '@ui/utils'
import { type Token } from '@ui-kit/features/activity-table'

export { LlammaActivityEvents } from './LlammaActivityEvents'
export { LlammaActivityTrades } from './LlammaActivityTrades'
export { useLlammaActivityEvents } from './hooks/useLlammaActivityEvents'
export { useLlammaActivityTrades } from './hooks/useLlammaActivityTrades'

export type LlammaActivityProps = {
  network: Chain | undefined
  collateralToken: Token | undefined
  borrowToken: Token | undefined
  ammAddress: Address | undefined
  endpoint: Endpoint
  networkConfig: BaseConfig | undefined
}
