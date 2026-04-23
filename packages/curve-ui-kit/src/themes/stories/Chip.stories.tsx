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
  { id: 'default', label: 'Label', icon: undefined, toggle: fn() },
  { id: 'with-icon', label: 'Label', icon: <CheckIcon />, toggle: fn() },
  { id: 'icon-only', label: undefined, icon: <CheckIcon />, toggle: fn() },
] as const

const VariantStory = ({
  selected = false,
  variant = 'outlined',
}: {
  selected?: boolean
  variant?: SelectableChipProps['variant']
}) => (
  <Grid container spacing={Spacing.lg.desktop}>
    {PROPS_ROWS.map(({ id, ...props }) =>
      sizes.map((size) => (
        <Grid key={`${id}-${size}-${selected}`} size={(1 / sizes.length) * 12}>
          <SelectableChip size={size} selected={selected} variant={variant} {...props} />
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
      options: ['outlined', 'ghost'],
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
    variant: 'outlined',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Selectable chip component with support for outlined and ghost variants, sizes, icons, and selected state.',
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
  render: () => <VariantStory />,
  parameters: {
    docs: {
      description: {
        story: 'Displays the unselected chip variant across all available sizes.',
      },
    },
  },
}

export const SelectedOutlined: Story = {
  render: () => <VariantStory selected />,
  parameters: {
    docs: {
      description: {
        story: 'Displays the selected chip variant across all available sizes.',
      },
    },
  },
}

export const Ghost: Story = {
  render: () => <VariantStory variant="ghost" />,
  args: {
    variant: 'ghost',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the ghost chip variant across all available sizes.',
      },
    },
  },
}

export const SelectedGhost: Story = {
  render: () => <VariantStory selected variant="ghost" />,
  args: {
    variant: 'ghost',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the selected ghost chip variant across all available sizes.',
      },
    },
  },
}

export default meta
