import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { CellContext } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'

export type PositionCellProps = CellContext<CurveTableFeatures, LlamaMarketRow, number | undefined>

// The skeleton is a block, so the cell's text alignment does not move it: the auto margin pushes it to the right
export const skeletonProps = { width: 40, sx: { marginInlineStart: 'auto' } } as const
