import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
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
    notionalValueUsd: {
      control: 'number',
      description: 'The USD value of the balance',
    },
    clickable: {
      control: 'boolean',
      description: 'The max button mode',
    },
    hideIcon: {
      control: 'boolean',
      description: 'Whether to hide the wallet icon',
    },
    onClick: {
      action: 'onClick',
      description: 'Callback when balance is clicked',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the component is in a loading state',
    },
  },
  args: {
    symbol: 'ETH',
    balance: 1.234,
    clickable: false,
    hideIcon: false,
    onClick: fn(),
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
    notionalValueUsd: 2345.67,
  },
}

export const Clickable: Story = {
  args: {
    clickable: true,
  },
}

export const NoIcon: Story = {
  args: {
    hideIcon: true,
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

export const Loading: Story = {
  args: {
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a loading state with skeleton placeholders',
      },
    },
  },
}

export default meta
