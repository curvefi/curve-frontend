import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { PoolRow } from '../types'
import { PointsRewardIcon } from './RewardIcons'
import { getCompactPointsCampaigns } from './utils'

const { Spacing } = SizesAndSpaces

export const PointsCell = ({ pool }: { pool: PoolRow }) => {
  const campaigns = getCompactPointsCampaigns(pool)

  if (!campaigns.length) {
    return (
      <Typography data-testid="pool-points" variant="tableCellMBold" sx={{ textAlign: 'end' }}>
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
        justifyContent: 'end',
        justifyItems: 'end',
      }}
    >
      {campaigns.map((campaign, index) => (
        <PointsRewardIcon
          // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns may describe distinct point rewards with the same platform metadata.
          key={`${campaign.platform}-${campaign.description}-${index}`}
          campaign={campaign}
        />
      ))}
    </Box>
  )
}
