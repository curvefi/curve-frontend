import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PartnerCard } from '@ui-kit/shared/ui/PartnerCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

// Usually they're used inside a grid or tab panel with a different background color,
// which makes it a bit more readable.
const PartnerCardWrapper = (args: Parameters<typeof PartnerCard>[0]) => (
  <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.xl }}>
    <PartnerCard {...args} />
  </Box>
)

const meta: Meta<typeof PartnerCard> = {
  title: 'UI Kit/Widgets/PartnerCard',
  component: PartnerCard,
  render: PartnerCardWrapper,
  argTypes: {
    name: {
      control: 'text',
      description: 'The name of the partner or protocol',
    },
    description: {
      control: 'text',
      description: 'A brief description of what the partner does',
    },
    imageId: {
      control: 'text',
      description: 'The image filename for the partner logo (null if no image)',
    },
    networks: {
      description: 'Object mapping network names to boolean values indicating support',
    },
    tags: {
      control: 'object',
      description: 'Array of tags/categories associated with the partner',
    },
    appUrl: {
      control: 'text',
      description: 'URL to the partner application (null if not available)',
    },
    twitterUrl: {
      control: 'text',
      description: 'URL to the partner Twitter/X profile (null if not available)',
    },
  },
}

type Story = StoryObj<typeof PartnerCard>

export const Default: Story = {
  args: {
    name: 'deBridge',
    description: 'Messaging and cross-chain interoperability protocol enabling the building of cross-chain dapps.',
    imageId: 'platforms/debridge.jpg',
    networks: {
      arbitrum: true,
      avalanche: true,
      bsc: true,
      base: true,
      ethereum: true,
      gnosis: true,
      hyperliquid: true,
      monad: true,
      optimism: true,
      polygon: true,
      sonic: true,
    },
    tags: ['Bridge', 'Cross-chain'],
    appUrl: 'https://debridge.com/',
    twitterUrl: 'https://x.com/deBridge',
  },
}

export const NoLinks: Story = {
  args: {
    name: 'Coming Soon Protocol',
    description: 'A new protocol that is still in development.',
    imageId: null,
    networks: { ethereum: true },
  },
}

export default meta
