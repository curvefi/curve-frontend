import { formatNetSupplyRate } from '@/llamalend/llama.utils'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { getUserSupplyTotalApy } from '../../user-position.utils'
import { RateCell } from './RateCell'

/** The supply APY with the user's total APY, their boost included, below it */
export const UserSupplyRateCell = (props: CellContext<CurveTableFeatures, LlamaMarketRow, number | null>) => (
  <RateCell {...props} getSubRate={market => formatNetSupplyRate(getUserSupplyTotalApy(market))} />
)
