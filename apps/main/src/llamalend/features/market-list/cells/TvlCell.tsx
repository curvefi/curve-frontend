import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { TvlTooltipContent } from '@/llamalend/widgets/tooltips/TvlTooltipContent'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { CompactUsdCell } from './CompactUsdCell'

export const TvlCell = ({ row, ...ctx }: CellContext<LlamaMarket, number>) => (
  <Tooltip title={t`TVL breakdown`} body={<TvlTooltipContent market={row.original} />} placement="top">
    <span>
      <CompactUsdCell row={row} {...ctx} />
    </span>
  </Tooltip>
)
