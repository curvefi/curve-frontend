import { getRewardsDescription } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/cell.utils'
import { GraphType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import { LlamaMarket } from '@/loan/entities/llama-markets'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { PointsIcon } from '@ui-kit/shared/icons/PointsIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useSnapshots } from '../hooks/useSnapshots'

const { IconSize, Spacing } = SizesAndSpaces

export const RateCell = ({ market, type }: { market: LlamaMarket; type: GraphType }) => {
  const { rate, averageRate } = useSnapshots(market, type)
  const { rewards } = market
  return (
    <Stack gap={Spacing.xs}>
      <Tooltip title={t`Average rate`} placement="top">
        <Typography variant="tableCellMBold" color="textPrimary">
          {averageRate == null ? rate || '-' : `${averageRate.toPrecision(4)}%`}
        </Typography>
      </Tooltip>

      <Stack direction="row" gap={Spacing.xs} alignSelf="end">
        {rate != null && (
          <Tooltip title={t`Current rate`} placement="top">
            <Typography variant="bodySRegular" color="textSecondary">
              ${rate.toPrecision(4)}%
            </Typography>
          </Tooltip>
        )}
        {rewards && (
          <Tooltip
            title={getRewardsDescription(rewards)}
            placement="top"
            data-testid={`rewards-${type}-${rewards.action}`}
          >
            <Chip
              icon={<PointsIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />}
              size="extraSmall"
              color="highlight"
              label={`x${rewards.multiplier}`}
            />
          </Tooltip>
        )}
      </Stack>
    </Stack>
  )
}
