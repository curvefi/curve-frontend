import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenIcon } from '../TokenIcon'

const meta: Meta<typeof TokenIcon> = {
  title: 'UI Kit/Widgets/TokenIcon',
  component: TokenIcon,
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
    badgeAddress: {
      control: 'text',
      description: 'Secondary token contract address shown as a bottom-right badge',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the icon belongs to a disabled element or not',
    },
    size: {
      control: 'select',
      options: ['sm', 'mui-sm', 'mui-md', 'lg', 'xl'],
      description: 'Size of the icon',
    },
    showChainIcon: {
      control: 'boolean',
      description: 'Whether to show the blockchain chain badge icon',
    },
  },
  args: {
    blockchainId: 'ethereum',
    tooltip: 'ETH',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    disabled: false,
    size: 'sm',
  },
}

type Story = StoryObj<typeof TokenIcon>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'TokenIcon displays a token logo with fallback to default image',
        story: 'Default view with small size',
      },
    },
  },
}

export const MuiSmall: Story = {
  args: {
    size: 'mui-sm',
  },
}

export const MuiMedium: Story = {
  args: {
    size: 'mui-md',
  },
}

export const WithFallback: Story = {
  args: {
    address: '0x0',
  },
}

export const WithChainIcon: Story = {
  args: {
    showChainIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Token icon with blockchain chain badge overlay.',
      },
    },
  },
}

export const WithSecondaryIcon: Story = {
  args: {
    badgeAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  parameters: {
    docs: {
      description: {
        story: 'Token icon with a secondary token badge overlay in the bottom-right corner.',
      },
    },
  },
}

export const WithChainAndSecondaryIcon: Story = {
  args: {
    badgeAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    showChainIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Token icon with a secondary token badge overlay and blockchain chain badge',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    badgeAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    showChainIcon: true,
    disabled: true,
  },
}

export default meta
