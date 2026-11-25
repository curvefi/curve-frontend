import Stack from '@mui/material/Stack'
import { Banner } from '@ui/features/banners/Banner'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CampaignRewardBadge } from './CampaignRewardBadge'
import type { CampaignRewards } from './types'

const { Spacing } = SizesAndSpaces

export type CampaignRewardsBannerProps = { campaignRewards: CampaignRewards[]; message: string }

export const CampaignRewardsBanner = ({ campaignRewards, message }: CampaignRewardsBannerProps) =>
  campaignRewards.length > 0 && (
    <Banner
      severity="highlight"
      learnMoreUrl={campaignRewards[0].dashboardLink}
      actions={
        <Stack component="span" direction="row" sx={{ gap: Spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {campaignRewards.map((reward, index) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key -- Campaigns can contain multiple rewards for the same address.
            <CampaignRewardBadge key={`${reward.address}-${index}`} rewardsPool={reward} color="highlight" banner />
          ))}
        </Stack>
      }
    >
      {message}
    </Banner>
  )
