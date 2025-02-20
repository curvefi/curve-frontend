import type { Meta, StoryObj } from '@storybook/react'
import { getImageBaseUrl } from '@ui/utils/utilsConstants'
import { TokenIcon } from '../TokenIcon'

const meta: Meta<typeof TokenIcon> = {
  title: 'UI Kit/Widgets/TokenIcon',
  component: TokenIcon,
  argTypes: {
    imageBaseUrl: {
      control: 'text',
      description: 'Base URL for token images',
    },
    token: {
      control: 'text',
      description: 'Token symbol',
    },
    address: {
      control: 'text',
      description: 'Token contract address',
    },
    size: {
      control: 'select',
      options: ['sm', 'mui-sm', 'mui-md', ''],
      description: 'Size of the icon',
    },
  },
  args: {
    imageBaseUrl: getImageBaseUrl('ethereum'),
    token: 'ETH',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
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

export default meta
