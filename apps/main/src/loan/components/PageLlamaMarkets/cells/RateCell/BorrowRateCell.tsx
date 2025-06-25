import { LlamaMarket } from '@/loan/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcons } from '@ui-kit/shared/ui/RewardIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatPercentFixed, useFilteredRewards } from '../cell.format'
import { BorrowRateTooltipContent } from './BorrowRateTooltipContent'

const { Spacing } = SizesAndSpaces

export const BorrowRateCell = ({ row }: CellContext<LlamaMarket, number>) => {
  const {
    rewards,
    type: marketType,
    rates: { borrow },
  } = row.original
  const poolRewards = useFilteredRewards(rewards, marketType, 'borrow')
  return (
    <Tooltip clickable title={t`Borrow Rate`} body={<BorrowRateTooltipContent market={row.original} />} placement="top">
      <Stack gap={Spacing.xs}>
        <Typography variant="tableCellMBold" color="textPrimary">
          {borrow != null && formatPercentFixed(borrow)}
        </Typography>

        {poolRewards.length > 0 && (
          <Stack direction="row" gap={Spacing.xs} alignSelf="end">
            <Chip
              icon={<RewardIcons size="sm" rewards={poolRewards} />}
              size="small"
              color="highlight"
              label={poolRewards.map((r) => r.multiplier).join(', ')}
            />
          </Stack>
        )}
      </Stack>
    </Tooltip>
  )
}
