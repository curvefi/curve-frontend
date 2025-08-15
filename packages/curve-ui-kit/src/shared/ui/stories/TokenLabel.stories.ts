import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenLabel } from '../TokenLabel'

const meta: Meta<typeof TokenLabel> = {
  title: 'UI Kit/Widgets/TokenLabel',
  component: TokenLabel,
  argTypes: {
    blockchainId: {
      control: 'text',
      description: 'Network the token is on',
    },
    tooltip: {
      control: 'text',
      description: 'Icon tooltip, mostly used for token symbol',
    },
    address: {
      control: 'text',
      description: 'Token contract address',
    },
    label: {
      control: 'text',
      description: 'Optional label to the right of the icon, usually the token symbol',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the icon and label belong to a disabled element or not',
    },
    size: {
      control: 'select',
      options: ['sm', 'mui-sm', 'mui-md', 'lg', 'xl'],
      description: 'Size of the icon',
    },
  },
  args: {
    blockchainId: 'ethereum',
    tooltip: 'ETH',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    label: 'ETH',
    disabled: false,
    size: 'sm',
  },
}

type Story = StoryObj<typeof TokenLabel>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'TokenLabel displays a token logo with label, often the token symbol',
        story: 'Default view with small size',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    disabled: true,
  },
}

export default meta
