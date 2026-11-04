import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@primitives/number.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { t } from '@ui/lib/i18n'
import type { PositionCellProps } from './cell.constants'

export const LtvCell = ({ getValue }: PositionCellProps) => {
  const ltv = getValue()
  return ltv ? (
    <Tooltip
      clickable
      title={t`LTV`}
      body={<CurrentLTVTooltipContent debtDenomination="Borrowed amount" />}
      placement="top"
    >
      <Typography variant="tableCellValue" color="textPrimary" sx={{ textAlign: 'right' }}>
        {formatNumber(ltv, 'percent.rate')}
      </Typography>
    </Tooltip>
  ) : (
    <Typography variant="tableCellValue" color="textSecondary" sx={{ textAlign: 'right' }}>
      -
    </Typography>
  )
}
