import type { Meta, StoryObj } from '@storybook/react-vite'
import { LeverageIcon } from '@ui-kit/shared/icons/LeverageIcon'
import { TokenInfo } from '../TokenInfo'

const meta: Meta<typeof TokenInfo> = {
  title: 'UI Kit/Widgets/TokenInfo',
  component: TokenInfo,
  argTypes: {
    address: {
      control: 'text',
      description: 'Token contract address',
    },
    blockchainId: {
      control: 'text',
      description: 'Network the token is on',
    },
    icon: {
      control: false,
      description: 'Custom icon node. Mutually exclusive with address and blockchainId.',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Whether the token icon renders before or after the labels',
    },
    primary: {
      control: 'text',
      description: 'Primary label, such as the token symbol or formatted token amount',
    },
    secondary: {
      control: 'text',
      description: 'Optional secondary label, such as notional value or token symbol',
    },
    showChainIcon: {
      control: 'boolean',
      description: 'Whether to show the blockchain chain badge icon',
    },
  },
  args: {
    iconPosition: 'left',
    primary: 'USDC',
    secondary: '$1.0001',
  },
}

type Story = StoryObj<typeof TokenInfo>

export const AssetCellUsage: Story = {
  args: {
    blockchainId: 'ethereum',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Asset-cell usage with the icon on the left, token symbol as primary label, and token value as secondary label.',
      },
    },
  },
}

export const PoolSwapUsage: Story = {
  args: {
    blockchainId: 'ethereum',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    iconPosition: 'right',
    primary: '10.420M',
    secondary: '$37.24M',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pool-swap table usage with the icon on the right, token amount as primary label, and notional value as secondary label.',
      },
    },
  },
}

export const CrvClaimRewardsUsage: Story = {
  args: {
    blockchainId: 'ethereum',
    address: '0xd533a949740bb3306d119cc777fa900ba034cd52',
    iconPosition: 'left',
    primary: '1,234.56',
    secondary: 'CRV',
    showChainIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'CRV-claim rewards usage with the icon on the left, token amount as primary label, and token symbol as secondary label.',
      },
    },
  },
}

export const NoSecondary: Story = {
  args: {
    blockchainId: 'ethereum',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    primary: 'USDC',
    secondary: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Token info with only the primary label.',
      },
    },
  },
}

export const CustomIcon: Story = {
  args: {
    icon: <LeverageIcon />,
    primary: 'Trading fees',
    secondary: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Token info with a custom icon node instead of a token icon.',
      },
    },
  },
}

export const NoIcon: Story = {
  args: {
    primary: '4.19%',
    secondary: 'Base 2.98%',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Token info with no icon, useful for yield data whose token icon is already displayed in the first column of a table',
      },
    },
  },
}

export default meta
