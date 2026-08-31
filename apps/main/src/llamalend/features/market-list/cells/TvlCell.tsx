import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { TvlTooltipContent } from '@/llamalend/widgets/tooltips/TvlTooltipContent'
import { t } from '@evm-ui/lib/i18n'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import type { CellContext } from '@tanstack/react-table'
import { CompactUsdCell } from './CompactUsdCell'

export const TvlCell = ({ row, ...ctx }: CellContext<CurveTableFeatures, LlamaMarketRow, number>) => (
  <Tooltip title={t`TVL breakdown`} body={<TvlTooltipContent market={row.original} />} placement="top">
    <span>
      <CompactUsdCell row={row} {...ctx} />
    </span>
  </Tooltip>
)
