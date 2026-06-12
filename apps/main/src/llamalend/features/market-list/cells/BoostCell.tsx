import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { BoostTooltipContent } from '@/llamalend/widgets/tooltips/BoostTooltipContent'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { formatNumber } from '@ui-kit/utils'

export const BoostCell = ({ getValue }: CellContext<LlamaMarket, number>) => (
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
