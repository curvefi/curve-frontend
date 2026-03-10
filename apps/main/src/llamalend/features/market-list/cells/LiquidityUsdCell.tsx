import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { LiquidityUsdTooltipContent } from '@/llamalend/widgets/tooltips/LiquidityUsdTooltipContent'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { CompactUsdCell } from './CompactUsdCell'

export const LiquidityUsdCell = ({ row, ...ctx }: CellContext<LlamaMarket, number>) => (
  <Tooltip
    title={t`Available liquidity breakdown`}
    body={<LiquidityUsdTooltipContent market={row.original} />}
    placement="top"
  >
    <span>
      <CompactUsdCell row={row} {...ctx} />
    </span>
  </Tooltip>
)
