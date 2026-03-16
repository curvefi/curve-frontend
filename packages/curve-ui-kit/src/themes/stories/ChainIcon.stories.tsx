import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'

const meta: Meta<typeof ChainIcon> = {
  title: 'UI Kit/Icons/ChainIcon',
  component: ChainIcon,
  argTypes: {
    blockchainId: {
      control: 'text',
      description: 'Blockchain network ID used to resolve the icon',
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl'],
      description: 'Responsive icon size token',
    },
    border: {
      control: 'boolean',
      description: 'Adds the highlighted badge border and background',
    },
  },
  args: {
    blockchainId: 'ethereum',
    size: 'md',
    border: false,
  },
}

type Story = StoryObj<typeof ChainIcon>

export const Default: Story = {}

export const Border: Story = {
  args: {
    border: true,
  },
}

export default meta
