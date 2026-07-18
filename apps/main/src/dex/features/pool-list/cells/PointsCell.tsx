import Box from '@mui/material/Box'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolRow } from '../types'
import { PointsRewardIcon } from './RewardIcons'
import { getPointsCampaigns } from './utils'

const { Spacing } = SizesAndSpaces
const MAX_POINTS_CAMPAIGNS = 4

export const PointsValue = ({
  pool,
  textAlign = 'end',
  tooltipPlacement,
  typographyVariant = 'tableCellMBold',
}: {
  pool: PoolRow
  textAlign?: 'start' | 'end'
  tooltipPlacement?: TooltipProps['placement']
  typographyVariant?: TypographyProps['variant']
}) => {
  const campaigns = getPointsCampaigns(pool).slice(0, MAX_POINTS_CAMPAIGNS)
  const alignment = textAlign === 'start' ? 'flex-start' : 'flex-end'

  if (!campaigns.length) {
    return (
      <Typography data-testid="pool-points" variant={typographyVariant} sx={{ textAlign }}>
        -
      </Typography>
    )
  }

  return (
    <Box
      data-testid="pool-points"
      sx={{
        display: campaigns.length > 1 ? 'grid' : 'flex',
        gridAutoFlow: 'column',
        gridTemplateRows: campaigns.length > 1 ? 'repeat(2, auto)' : undefined,
        columnGap: Spacing.sm,
        rowGap: Spacing.xs,
        justifyContent: alignment,
        maxWidth: '12rem',
      }}
    >
      {campaigns.map((campaign, index) => (
        <PointsRewardIcon
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct point rewards with the same platform metadata.
          key={`${campaign.platform}-${campaign.description}-${index}`}
          campaign={campaign}
          placement={tooltipPlacement}
          typographyVariant={typographyVariant}
        />
      ))}
    </Box>
  )
}

export const PointsCell = ({ pool }: { pool: PoolRow }) => <PointsValue pool={pool} />
