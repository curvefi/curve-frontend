import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@evm-ui/lib/i18n'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { formatNumber } from '@evm-ui/utils'

export const BoostCell = ({ getValue }: CellContext<LlamaMarketRow, number>) => (
  <WithWrapper
    Wrapper={Tooltip}
    shouldWrap={getValue()}
    clickable
    title={t`Boost`}
    body={<BoostTooltipContent />}
    placement="top"
  >
    <Typography variant="tableCellMBold" color="textPrimary" sx={{ textAlign: 'right' }}>
      {formatNumber(getValue(), 'multiplier')}
    </Typography>
  </WithWrapper>
)
