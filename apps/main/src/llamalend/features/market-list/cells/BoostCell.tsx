import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import type { CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { formatNumber } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { t } from '@ui/lib/i18n'

export const BoostCell = ({ getValue }: CellContext<CurveTableFeatures, LlamaMarketRow, number>) => (
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
