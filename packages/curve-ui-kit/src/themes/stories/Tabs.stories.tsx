import { useState } from 'react'
import { Stack } from '@mui/material'
import { objectKeys } from '@curvefi/primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SIZE_TO_ICON_SIZE } from '@ui-kit/shared/ui/Tabs/tabs-kebab'
import { LlamaIcon } from '../../shared/icons/LlamaIcon'
import { TabsSwitcher, type TabOption, type TabsSwitcherProps } from '../../shared/ui/Tabs/TabsSwitcher'
import { TABS_SIZES_CLASSES } from '../components/tabs/mui-tabs'

type TabValue = string
const VARIANTS = ['contained', 'underlined', 'overlined'] as const
const TABS_LABELS = ['Deposit', 'Withdraw', 'Staking', 'Unstaking'] as const
const DEFAULT_TABS: TabOption<TabValue>[] = Array.from({ length: 8 }, (_, i) => ({
  value: `${i}`,
  label: TABS_LABELS[i % TABS_LABELS.length],
}))

const TAB_SIZE_KEYS = objectKeys(TABS_SIZES_CLASSES)

const getOptionsWithAdornments = (
  count: number,
  size: keyof typeof TABS_SIZES_CLASSES = 'medium',
): TabOption<TabValue>[] => {
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

const getOptionsWithIconsOnly = (count: number, size: keyof typeof TABS_SIZES_CLASSES): TabOption<TabValue>[] => {
  const iconSize = SIZE_TO_ICON_SIZE[size]

  return DEFAULT_TABS.slice(0, count).map((tab) => ({
    ...tab,
    label: null,
    startAdornment: <LlamaIcon sx={{ width: iconSize, height: iconSize }} />,
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

const meta: Meta<typeof TabsSwitcherWrapper> = {
  title: 'UI Kit/Primitives/Tabs',
  component: TabsSwitcherWrapper,
  args: {
    overflow: 'standard',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: VARIANTS,
    },
    size: {
      control: 'select',
      options: TAB_SIZE_KEYS,
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    overflow: {
      control: 'select',
      options: ['standard', 'kebab', 'fullWidth'],
    },
  },
}

export default meta
type Story = StoryObj<typeof TabsSwitcherWrapper>

export const Contained: Story = {
  args: {
    variant: 'contained',
  },
  render: (args) => (
    <Stack gap={4}>
      {TAB_SIZE_KEYS.map((size) => (
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
      {TAB_SIZE_KEYS.map((size) => (
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
      {TAB_SIZE_KEYS.map((size) => (
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

export const VerticalContained: Story = {
  args: {
    variant: 'contained',
    orientation: 'vertical',
  },
  render: (args) => (
    <Stack gap={4} direction="row">
      {TAB_SIZE_KEYS.map((size) => (
        <TabsSwitcherWrapper key={size} {...args} size={size} options={getOptionsWithAdornments(4, size)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical contained tabs with adornments and suffix for each size',
      },
    },
  },
}

export const VerticalUnderlined: Story = {
  args: {
    variant: 'underlined',
    orientation: 'vertical',
  },
  render: (args) => (
    <Stack gap={4} direction="row">
      {TAB_SIZE_KEYS.map((size) => (
        <TabsSwitcherWrapper key={size} {...args} size={size} options={getOptionsWithAdornments(4, size)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical underlined tabs with adornments and suffix for each size',
      },
    },
  },
}

export const VerticalOverlined: Story = {
  args: {
    variant: 'overlined',
    orientation: 'vertical',
  },
  render: (args) => (
    <Stack gap={4} direction="row">
      {TAB_SIZE_KEYS.map((size) => (
        <TabsSwitcherWrapper key={size} {...args} size={size} options={getOptionsWithAdornments(4, size)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Vertical overlined tabs with adornments and suffix for each size',
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

export const IconsOnly: Story = {
  render: () => (
    <Stack gap={4}>
      {TAB_SIZE_KEYS.map((size) => (
        <Stack key={size} gap={4} direction="row" alignItems="center">
          {VARIANTS.map((variant) => (
            <TabsSwitcherWrapper
              key={`${variant}-${size}`}
              variant={variant}
              size={size}
              overflow="standard"
              options={getOptionsWithIconsOnly(4, size)}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only tabs for each variant and size',
      },
    },
  },
}

export const OverflowFullWidth: Story = {
  args: {
    variant: 'contained',
    overflow: 'fullWidth',
  },
  render: (args) => (
    <Stack gap={4} width="40rem">
      {VARIANTS.map((variant) => (
        <TabsSwitcherWrapper key={variant} {...args} variant={variant} options={getOptionsWithAdornments(3)} />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Contained tabs with fullWidth variant for each size',
      },
    },
  },
}

export const OverflowKebab: Story = {
  args: {
    variant: 'contained',
    overflow: 'kebab',
  },
  render: (args) => (
    <Stack gap={4} width="30rem">
      {TAB_SIZE_KEYS.map((size) => (
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
