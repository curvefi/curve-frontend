import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { TvlTooltipContent } from '@/llamalend/widgets/tooltips/TvlTooltipContent'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { t } from '@ui/lib/i18n'
import { CompactUsdCell } from './CompactUsdCell'

export const TvlCell = ({ row, ...ctx }: CellContext<CurveTableFeatures, LlamaMarketRow, number>) => (
  <Tooltip title={t`TVL breakdown`} body={<TvlTooltipContent market={row.original} />} placement="top">
    <span>
      <CompactUsdCell row={row} {...ctx} />
    </span>
  </Tooltip>
)
