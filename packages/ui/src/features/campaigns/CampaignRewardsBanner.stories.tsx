import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CampaignRewardBadge } from './CampaignRewardBadge'
import { CampaignRewardsBanner } from './CampaignRewardsBanner'
import { CampaignTooltipContent } from './CampaignTooltipContent'
import type { CampaignRewards } from './types'

const ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#1969ff"/><path d="M8 22V10l8 8 8-8v12" fill="none" stroke="white" stroke-width="3"/></svg>')}`

const tokens: CampaignRewards = {
  campaignName: 'Pool liquidity rewards',
  platform: 'Merkl',
  platformImageId: ICON,
  dashboardLink: 'https://app.merkl.xyz',
  address: '0x0000000000000000000000000000000000000001',
  network: 'ethereum',
  action: 'lp',
  tags: ['tokens'],
  isMerkl: true,
  description: 'Provide liquidity to this pool to earn additional token rewards.',
  lock: false,
  symbol: 'CRV',
  reward: { type: 'apr', value: 12.5, address: '0x0000000000000000000000000000000000000002' },
  period: [new Date('2026-01-01T00:00:00Z'), new Date('2026-12-31T00:00:00Z')],
  steps: ['Provide liquidity to the pool.', 'Claim rewards through the issuer dashboard.'],
}

const points: CampaignRewards = {
  ...tokens,
  campaignName: 'Liquidity points',
  platform: 'Points partner',
  isMerkl: false,
  tags: ['points'],
  reward: { type: 'points', value: 3 },
  symbol: 'POINTS',
  lock: true,
}

const meta = {
  title: 'UI/Campaigns/Campaign Banner',
  component: CampaignRewardsBanner,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { campaignRewards: [tokens], message: 'Liquidity providers in this pool also earn additional tokens!' },
} satisfies Meta<typeof CampaignRewardsBanner>

export default meta
type Story = StoryObj<typeof meta>

export const MerklTokens: Story = {}
export const Points: Story = {
  args: { campaignRewards: [points], message: 'Liquidity providers in this pool also earn points!' },
}
export const MixedRewards: Story = { args: { campaignRewards: [tokens, points] } }
export const Lending: Story = {
  args: {
    campaignRewards: [
      { ...tokens, action: 'supply' },
      { ...tokens, action: 'borrow', lock: true },
    ],
    message: 'Supplying and borrowing in this market earns yield',
  },
}
export const Narrow: Story = {
  args: { campaignRewards: [tokens, points, { ...points, reward: undefined, symbol: 'ELIGIBLE' }] },
  decorators: [
    Story => (
      <Box sx={{ width: 320, maxWidth: '100%' }}>
        <Story />
      </Box>
    ),
  ],
}
export const Empty: Story = { args: { campaignRewards: [] } }
export const RewardBadges: Story = {
  render: () => (
    <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
      {[
        tokens,
        points,
        { ...points, reward: undefined, symbol: 'ELIGIBLE' },
        { ...points, reward: { type: 'points' as const, value: 0 } },
      ].map((campaign, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- Static story examples.
        <CampaignRewardBadge key={index} rewardsPool={campaign} />
      ))}
    </Stack>
  ),
}
export const TooltipDetails: Story = { render: () => <CampaignTooltipContent campaign={tokens} showRate /> }
