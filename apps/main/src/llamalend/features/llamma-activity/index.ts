import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type BaseConfig } from '@ui/utils'
import type { QueryProp } from '@ui-kit/types/util'

export { LlammaActivityEvents } from './LlammaActivityEvents'
export { LlammaActivityTrades } from './LlammaActivityTrades'

export type LlammaActivityProps = {
  marketQuery: QueryProp<LlamaMarketTemplate>
  networkConfig: BaseConfig | undefined
}
