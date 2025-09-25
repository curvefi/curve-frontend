import type { ComponentProps } from 'react'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { toPrecise } from '@ui-kit/utils'
import { Balance } from '../Balance'

export const BalanceWrapper = ({
  balance,
  notionalValueUsd,
  ...props
}: Omit<ComponentProps<typeof Balance>, 'balance' | 'notionalValueUsd'> & {
  balance: number
  notionalValueUsd?: number
}) => <Balance balance={toPrecise(balance)} notionalValueUsd={toPrecise(notionalValueUsd)} {...props} />

const meta: Meta<typeof BalanceWrapper> = {
  title: 'UI Kit/Widgets/Balance',
  component: BalanceWrapper,
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
    loading: {
      control: 'boolean',
      description: 'Whether the component is in a loading state',
    },
  },
  args: {
    symbol: 'ETH',
    balance: 1.234,
    max: 'off',
    hideIcon: false,
    onMax: fn(),
  },
}

type Story = StoryObj<typeof BalanceWrapper>

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
    notionalValueUsd: 69420.42,
    max: 'button',
  },
}

export const FullFeaturedWithMaxBalance: Story = {
  args: {
    balance: 42.69,
    notionalValueUsd: 69420.42,
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

export const LoadingWithNotionalValueAndMax: Story = {
  args: {
    loading: true,
    notionalValueUsd: 1234.56,
    max: 'button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a loading state with notional value skeleton and max button',
      },
    },
  },
}

export default meta
