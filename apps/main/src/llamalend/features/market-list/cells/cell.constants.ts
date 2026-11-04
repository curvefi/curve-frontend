import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'

export type PositionCellProps = CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>
