import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { Balance } from '../LargeTokenInput/Balance'

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
    usdRate: {
      control: 'number',
      description: 'The USD price of the token',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the clickable balance is disabled',
    },
    prefix: {
      control: 'object',
      description: 'Label, custum icon or nothing to show before the actual balance',
    },
    tooltip: {
      control: 'text',
      description: 'Custom tooltip title for hover',
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
    disabled: false,
    prefix: undefined,
    tooltip: undefined,
    onClick: undefined,
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
    usdRate: 2345.67,
  },
}

export const Clickable: Story = {
  args: {
    onClick: fn(),
  },
}

export const ClickableButDisabled: Story = {
  args: {
    onClick: fn(),
    disabled: true,
  },
}

export const NoIcon: Story = {
  args: {
    prefix: null,
  },
}

export const DifferentIcon: Story = {
  args: {
    prefix: FireIcon,
  },
}

export const WithLabel: Story = {
  args: {
    prefix: 'Max borrow:',
  },
}

export const ZeroBalance: Story = {
  args: {
    balance: 0,
  },
}

export const NoBalance: Story = {
  args: {
    loading: false,
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

export const CustomTooltip: Story = {
  args: {
    tooltip: 'Yolo',
  },
}

export default meta
