import { fn } from 'storybook/test'
import CheckIcon from '@mui/icons-material/Check'
import Grid from '@mui/material/Grid'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type SelectableChipProps, SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const sizes = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'] satisfies SelectableChipProps['size'][]

type Story = StoryObj<typeof SelectableChip>

const PROPS_ROWS = [
  { id: 'default', label: 'Label', icon: undefined, toggle: fn(), onDelete: undefined },
  { id: 'with-icon', label: 'Label', icon: <CheckIcon />, toggle: fn(), onDelete: undefined },
  { id: 'icon-only', label: undefined, icon: <CheckIcon />, toggle: fn(), onDelete: undefined },
  { id: 'selected', label: 'Label', icon: undefined, toggle: fn(), onDelete: fn() },
] as const

const OutlinedStory = ({ selected = false }: { selected?: boolean }) => (
  <Grid container spacing={Spacing.lg.desktop}>
    {PROPS_ROWS.map(({ id, ...props }) =>
      sizes.map((size) => (
        <Grid key={`${id}-${size}-${selected}`} size={(1 / sizes.length) * 12}>
          <SelectableChip size={size} selected={selected} {...props} />
        </Grid>
      )),
    )}
  </Grid>
)

const meta: Meta<typeof SelectableChip> = {
  title: 'UI Kit/Primitives/Chips',
  component: SelectableChip,
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: 'The variant of the component.',
    },
    label: {
      control: 'text',
      description: 'The label displayed inside the chip.',
    },
    size: {
      control: 'select',
      options: sizes,
      description: 'The size of the component.',
    },
    selected: {
      control: 'boolean',
      description: 'The selected state of the component.',
    },
    disabled: {
      control: 'boolean',
      description: 'The disabled state of the component.',
    },
    icon: {
      control: false,
      description: 'Optional icon rendered before the label.',
    },
    onDelete: {
      control: false,
      description: 'Optional delete action shown when the chip is selected.',
    },
    toggle: {
      control: false,
      description: 'Click handler used to toggle the chip selection.',
    },
  },
  args: {
    label: 'Label',
    size: 'medium',
    selected: false,
    disabled: false,
    toggle: fn(),
  },
  parameters: {
    docs: {
      description: {
        component: 'Selectable chip component with support for sizes, icons, and selected state.',
      },
    },
  },
}

export const Chip: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default selectable chip with configurable props.',
      },
    },
  },
}

export const Outlined: Story = {
  render: () => <OutlinedStory />,
  parameters: {
    docs: {
      description: {
        story: 'Displays the unselected chip variant across all available sizes.',
      },
    },
  },
}

export const SelectedOutlined: Story = {
  render: () => <OutlinedStory selected />,
  parameters: {
    docs: {
      description: {
        story: 'Displays the selected chip variant across all available sizes.',
      },
    },
  },
}

export default meta
