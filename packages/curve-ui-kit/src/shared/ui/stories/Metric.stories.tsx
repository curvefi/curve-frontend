import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { constQ, q } from '@ui-kit/types/util'
import { Metric, SIZES, ALIGNMENTS } from '../Metric'

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
    labelTooltip: {
      control: 'text',
      description: 'Optional tooltip shown next to the label',
    },
    valueTooltip: {
      control: 'text',
      description: 'Optional tooltip shown when hovering the metric value',
    },
    value: {
      control: 'object',
      description: 'The value of the component',
    },
    valueOptions: {
      control: 'object',
      description: 'Options for formatting the value including decimals, abbreviation, and unit',
    },
    change: {
      control: 'number',
      description: 'Optional value to denote a change in percentage since last time, whenever that may be',
    },
    notional: {
      control: 'object',
      description: 'Optional notional values that gives context or underlying value of the key metric',
    },
  },
  args: {
    size: 'medium',
    alignment: 'start',
    value: constQ(26539422),
    valueOptions: {
      decimals: 1,
      unit: 'dollar',
      color: 'textPrimary',
    },
    label: 'Metrics label',
    copyText: 'Copied metric value',
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
    value: constQ(133.42),
    valueOptions: {
      decimals: 2,
      unit: 'percentage',
    },
  },
}

export const Tooltip: Story = {
  args: {
    labelTooltip: { title: "Alu's future portfolio value", body: <Typography variant="headingXxl">ZERO</Typography> },
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
    value: q({ data: undefined, isLoading: true, error: null }),
  },
}

export const Notional: Story = {
  args: {
    notional: constQ({
      value: 50012345.345353,
      decimals: 2,
      abbreviate: true,
      unit: { symbol: ' ETH', position: 'suffix' },
    }),
  },
}

export const NotionalString: Story = {
  args: {
    notional: constQ('1337.69% close to reckage'),
  },
}

export const CustomUnit: Story = {
  args: {
    valueOptions: {
      unit: {
        symbol: '¥',
        position: 'prefix',
      },
    },
    change: 0,
  },
}

export const CustomValueFontColor: Story = {
  args: {
    valueOptions: {
      color: 'danger',
    },
  },
}

export const NotAvailable: Story = {
  args: {
    value: q({ data: undefined, isLoading: false, error: null }),
    label: 'Metric with N/A Value',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the Metric component when the value is not available (e.g., null, undefined, "", false, NaN).',
      },
    },
  },
}

export const RightAdornment: Story = {
  args: {
    size: 'large',
    rightAdornment: <FireIcon fontSize="small" color="error" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the Metric component with a right adornment',
      },
    },
  },
}

export default meta
