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
    tooltip: {
      control: 'text',
      description: 'Optional tooltip shown next to the label',
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
    change: {
      control: 'number',
      description: 'Optional value to denote a change in percentage since last time, whenever that may be',
    },
    notional: {
      control: 'number',
      description: 'Optional notional value that gives context or underlying value of the key metric',
    },
    notionalAbbreviate: {
      control: 'boolean',
    },
    notionalDecimals: {
      control: 'number',
    },
    notionalUnit: {
      control: 'select',
      options: UNITS,
    },
  },
  args: {
    size: 'medium',
    alignment: 'start',
    value: 26539422,
    decimals: 1,
    label: 'Metrics label',
    unit: 'dollar',
  },
}

type Story = StoryObj<typeof Metric>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'Metric',
        story: 'Simple metric widget showing a dollar value with no special features',
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

export const Tooltip: Story = {
  args: {
    tooltip: "Alu's future portfolio value",
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

export const Loading: Story = {
  args: {
    loading: true,
  },
}

export const Notional: Story = {
  args: {
    notional: 50012345.345353,
    notionalAbbreviate: true,
    notionalDecimals: 2,
    notionalUnit: {
      symbol: ' ETH',
      position: 'suffix',
      abbreviate: true,
    },
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
