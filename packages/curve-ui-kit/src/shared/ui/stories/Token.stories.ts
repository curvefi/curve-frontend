import type { Meta, StoryObj } from '@storybook/react'
import { Token } from '../Token'

const meta: Meta<typeof Token> = {
  title: 'UI Kit/Widgets/Token',
  component: Token,
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
    size: {
      control: 'select',
      options: ['sm', 'mui-sm', 'mui-md', 'xl'],
      description: 'Size of the icon',
    },
  },
  args: {
    blockchainId: 'ethereum',
    tooltip: 'ETH',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    size: 'sm',
  },
}

type Story = StoryObj<typeof Token>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'Token displays a token logo with fallback to default image',
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

export const WithLabel: Story = {
  args: {
    label: 'ETH',
  },
}

export default meta
