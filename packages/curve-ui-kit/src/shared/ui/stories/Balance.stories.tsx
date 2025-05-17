import type { Meta, StoryObj } from '@storybook/react'
import { Balance } from '../Balance'

const meta: Meta<typeof Balance> = {
  title: 'UI Kit/Widgets/Balance',
  component: Balance,
  argTypes: {
    symbol: {
      control: 'text',
      description: 'The token symbol',
    },
    balance: {
      control: 'number',
      description: 'The token balance',
    },
    notionalValue: {
      control: 'number',
      description: 'The USD value of the balance',
    },
    max: {
      control: 'select',
      options: ['balance', 'button', 'off'],
      description: 'The max button mode',
    },
    hideIcon: {
      control: 'boolean',
      description: 'Whether to hide the wallet icon',
    },
    onMax: {
      action: 'onMax',
      description: 'Callback when max button is clicked',
    },
  },
  args: {
    symbol: 'ETH',
    balance: 1.234,
    max: 'off',
    hideIcon: false,
    onMax: (maxValue: number) => {
      // eslint-disable-next-line no-console
      console.log('Max value:', maxValue)
    },
  },
}

type Story = StoryObj<typeof Balance>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'Balance',
        story: 'Simple balance widget showing a token balance',
      },
    },
  },
}

export const WithNotionalValue: Story = {
  args: {
    notionalValue: 2345.67,
  },
}

export const WithMaxButton: Story = {
  args: {
    max: 'button',
  },
}

export const WithMaxBalance: Story = {
  args: {
    max: 'balance',
  },
}

export const NoIcon: Story = {
  args: {
    hideIcon: true,
  },
}

export const FullFeatured: Story = {
  args: {
    balance: 42.69,
    notionalValue: 69420.42,
    max: 'button',
  },
}

export const FullFeaturedWithMaxBalance: Story = {
  args: {
    balance: 42.69,
    notionalValue: 69420.42,
    max: 'balance',
  },
}

export const ZeroBalance: Story = {
  args: {
    balance: 0,
  },
}

export const NoBalance: Story = {
  args: {
    balance: undefined,
  },
}

export default meta
