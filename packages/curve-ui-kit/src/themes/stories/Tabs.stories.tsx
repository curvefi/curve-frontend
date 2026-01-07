import { useState } from 'react'
import { Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LlamaIcon } from '../../shared/icons/LlamaIcon'
import { TabsSwitcher, type TabOption, type TabsSwitcherProps } from '../../shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import { TABS_SIZES_CLASSES } from '../components/tabs/mui-tabs'

const { IconSize } = SizesAndSpaces

type TabValue = string
const tabsLabels = ['Deposit', 'Withdraw', 'Staking', 'Unstaking']

const DEFAULT_TABS: TabOption<TabValue>[] = Array.from({ length: 8 }, (_, i) => ({
  value: `${i}`,
  label: tabsLabels[i % tabsLabels.length],
}))

const SIZE_TO_ICON_SIZE = {
  small: IconSize.sm,
  medium: IconSize.md,
  extraExtraLarge: IconSize.lg,
} as const

const getOptionsWithAdornments = (count: number, size: keyof typeof TABS_SIZES_CLASSES): TabOption<TabValue>[] => {
  const iconSize = SIZE_TO_ICON_SIZE[size]

  return DEFAULT_TABS.slice(0, count).map((tab, i) => ({
    ...tab,
    suffix: `${i + 1}`,
    ...(size !== 'extraExtraLarge' && {
      startAdornment: <LlamaIcon sx={{ width: iconSize, height: iconSize }} />,
      endAdornment: <LlamaIcon sx={{ width: iconSize, height: iconSize }} />,
    }),
  }))
}

const TabsSwitcherWrapper = ({
  options,
  ...props
}: Omit<TabsSwitcherProps<TabValue>, 'value' | 'onChange' | 'options'> & {
  options: TabOption<TabValue>[]
}) => {
  const [value, setValue] = useState<TabValue | undefined>(options[0]?.value)
  return <TabsSwitcher {...props} options={options} value={value} onChange={setValue} />
}

/**
 * META
 */
const meta: Meta<typeof TabsSwitcherWrapper> = {
  title: 'UI Kit/Primitives/Tabs',
  component: TabsSwitcherWrapper,
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'underlined', 'overlined'],
    },
    size: {
      control: 'select',
      options: Object.keys(TABS_SIZES_CLASSES),
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    muiVariant: {
      control: 'select',
      options: ['standard', 'scrollable', 'fullWidth'],
    },
  },
}

export default meta
type Story = StoryObj<typeof TabsSwitcherWrapper>

export const Default: Story = {
  args: {
    variant: 'contained',
    size: 'small',
  },
  render: (args) => <TabsSwitcherWrapper {...args} options={DEFAULT_TABS.slice(0, 4)} />,
  parameters: {
    docs: {
      description: {
        story: 'Small contained tabs without adornments and suffix',
      },
    },
  },
}

export const Contained: Story = {
  args: {
    variant: 'contained',
  },
  render: (args) => (
    <Stack gap={4}>
      {(Object.keys(TABS_SIZES_CLASSES) as Array<keyof typeof TABS_SIZES_CLASSES>).map((size) => (
        <TabsSwitcherWrapper key={size} {...args} size={size} options={getOptionsWithAdornments(4, size)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Contained tabs with adornments and suffix for each size',
      },
    },
  },
}

export const Underlined: Story = {
  args: {
    variant: 'underlined',
  },
  render: (args) => (
    <Stack gap={4}>
      {(Object.keys(TABS_SIZES_CLASSES) as Array<keyof typeof TABS_SIZES_CLASSES>).map((size) => (
        <TabsSwitcherWrapper key={size} {...args} size={size} options={getOptionsWithAdornments(4, size)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Underlined tabs with adornments and suffix for each size',
      },
    },
  },
}

export const Overlined: Story = {
  args: {
    variant: 'overlined',
  },
  render: (args) => (
    <Stack gap={4}>
      {(Object.keys(TABS_SIZES_CLASSES) as Array<keyof typeof TABS_SIZES_CLASSES>).map((size) => (
        <TabsSwitcherWrapper key={size} {...args} size={size} options={getOptionsWithAdornments(4, size)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overlined tabs with adornments and suffix for each size',
      },
    },
  },
}

export const NoInactiveBorders: Story = {
  args: {
    variant: 'underlined',
    hideInactiveBorders: true,
  },
  render: (args) => <TabsSwitcherWrapper {...args} options={getOptionsWithAdornments(3, args.size ?? 'small')} />,
  parameters: {
    docs: {
      description: {
        story: 'Underlined tabs with inactive borders hidden',
      },
    },
  },
}

export const OrientationVertical: Story = {
  args: {
    variant: 'contained',
    orientation: 'vertical',
  },
  render: (args) => (
    <Stack direction="row" gap={4}>
      <TabsSwitcherWrapper {...args} options={getOptionsWithAdornments(4, args.size ?? 'small')} />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Contained tabs with vertical orientation',
      },
    },
  },
}

export const ContainedScrollableTabs: Story = {
  args: {
    variant: 'contained',
    muiVariant: 'scrollable',
  },
  render: (args) => (
    <Stack gap={4} sx={{ maxWidth: '24rem' }}>
      {(Object.keys(TABS_SIZES_CLASSES) as Array<keyof typeof TABS_SIZES_CLASSES>).map((size) => (
        <TabsSwitcherWrapper key={size} {...args} size={size} options={getOptionsWithAdornments(8, size)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Contained tabs with scrollable variant for each size',
      },
    },
  },
}
