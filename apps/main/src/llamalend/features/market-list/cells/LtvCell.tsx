import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { Box } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@evm-ui/lib/i18n'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { formatNumber } from '@evm-ui/utils'

export const LtvCell = ({ getValue, row }: CellContext<LlamaMarketRow, number | undefined>) => {
  const { stats, prices } = row.original.positionQueries
  const ltv = getValue()

  if (stats.isLoading || prices.borrowed.isLoading || prices.collateral.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'end' }}>
        <Typography variant="tableCellMBold" sx={{ textAlign: 'right' }}>
          <Skeleton variant="text" width={40} />
        </Typography>
      </Box>
    )
  }

  if (!ltv || stats.error || prices.borrowed.error || prices.collateral.error) {
    return (
      <Typography variant="tableCellMBold" color="textSecondary" sx={{ textAlign: 'right' }}>
        -
      </Typography>
    )
  }

  return (
    <Tooltip
      clickable
      title={t`LTV`}
      body={<CurrentLTVTooltipContent debtDenomination="Borrowed amount" />}
      placement="top"
    >
      <Typography variant="tableCellMBold" color="textPrimary" sx={{ textAlign: 'right' }}>
        {formatNumber(ltv, 'percent.rate')}
      </Typography>
    </Tooltip>
  )
}
