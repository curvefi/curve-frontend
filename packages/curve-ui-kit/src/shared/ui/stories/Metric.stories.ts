import { Metric, SIZES, ALIGNMENTS, UNITS } from '../Metric'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Metric> = {
  title: 'UI Kit/Widgets/Metric',
  component: Metric,
  argTypes: {
    size: {
      control: 'select',
      options: SIZES,
      description: 'The size of the component',
    },
    alignment: {
      control: 'select',
      options: ALIGNMENTS,
      description: 'The alignment of the component',
    },
    label: {
      control: 'text',
      description: 'The label on top of the value describing it',
    },
    value: {
      control: 'number',
      description: 'The value of the component',
    },
    decimals: {
      control: 'number',
      description: 'The number of decimals used in value rounding when using the default value formatter',
    },
    abbreviate: {
      control: 'boolean',
      description: 'Should the value be abbreviated together with a suffix? Does not work with a postfix unit.',
    },
    unit: {
      control: 'select',
      options: UNITS,
      description: 'Optional unit like dollars or percentage to give context to the number',
    },
    notional: {
      control: 'boolean',
      description: 'Whether or not the notational label below the value should be displayed',
    },
    notionalSymbol: {
      control: 'text',
      description: 'The unit that goes after the notional value if enabled',
    },
  },
  args: {
    size: 'medium',
    alignment: 'start',
    value: 26539422,
    decimals: 1,
    label: 'Metrics label',
    unit: 'dollar',
    notional: true,
    notionalSymbol: 'ETH',
  },
}

type Story = StoryObj<typeof Metric>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'Metric',
        story: 'Metric widget with all value properties in use',
      },
    },
  },
}

export const Percentage: Story = {
  args: {
    value: 1337.42,
    decimals: 2,
    unit: 'percentage',
  },
}

export const LargeCenter: Story = {
  args: {
    size: 'large',
    alignment: 'center',
    change: -5,
  },
}

export const ExtraLargeRight: Story = {
  args: {
    size: 'extraLarge',
    alignment: 'end',
    change: 5,
  },
}

export const CustomUnit: Story = {
  args: {
    unit: {
      symbol: '¥',
      position: 'prefix',
      abbreviate: true,
    },
    change: 0,
  },
}

export default meta
