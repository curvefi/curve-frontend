import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { StackedChainIcons } from '../StackedChainIcons'

const BLOCKCHAIN_IDS = [
  'ethereum',
  'arbitrum',
  'optimism',
  'base',
  'polygon',
  'gnosis',
  'avalanche',
  'fantom',
  'sonic',
  'fraxtal',
]

const OVERLAPS = [1 / 4, 1 / 3, 1 / 2]

const meta: Meta<typeof StackedChainIcons> = {
  title: 'UI Kit/Widgets/StackedChainIcons',
  component: StackedChainIcons,
  argTypes: {
    blockchainIds: {
      control: 'object',
      description: 'Blockchain network IDs to display in the stack',
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl'],
      description: 'Responsive icon size token',
    },
    overlap: {
      control: 'number',
      description: 'Percentage of icon width used for the overlap offset',
    },
  },
  args: {
    blockchainIds: BLOCKCHAIN_IDS,
  },
}

type Story = StoryObj<typeof StackedChainIcons>

export const Default: Story = {}

export const OverlapPercentages: Story = {
  render: args => (
    <Stack gap={2}>
      {OVERLAPS.map(overlap => (
        <Stack key={overlap} gap={4} direction="row">
          <Typography variant="bodySRegular">{(overlap * 100).toFixed(0).toString()}%</Typography>
          <StackedChainIcons {...args} overlap={overlap} />
        </Stack>
      ))}
    </Stack>
  ),
}

export default meta
