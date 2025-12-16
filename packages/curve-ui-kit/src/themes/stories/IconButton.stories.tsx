import { fn } from 'storybook/test'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronLeftIcon } from '@ui-kit/shared/icons/ChevronLeftIcon'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'

const sizes: NonNullable<IconButtonProps['size']>[] = ['extraExtraSmall', 'extraSmall', 'small', 'medium', 'large']
const colors: NonNullable<IconButtonProps['color']>[] = [
  'primary',
  'secondary',
  'ghost',
  'outlined',
  'navigation',
  'success',
  'error',
]

const meta: Meta<typeof IconButton> = {
  title: 'UI Kit/Primitives/IconButton',
  component: IconButton,
  argTypes: {
    size: {
      control: 'select',
      options: sizes,
      description: 'The size of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'The disabled state of the component',
    },
  },
  args: {
    size: 'medium',
    disabled: false,
    onClick: fn(),
  },
}

type Story = StoryObj<typeof IconButton>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'IconButton component with customizable sizes and colors',
        story: 'Default IconButton with ChevronLeft icon',
      },
    },
  },
  args: {
    children: <LlamaIcon />,
  },
}

export const AllSizes: Story = {
  render: () => (
    <Stack direction="row" gap={2} alignItems="center">
      {sizes.map((size) => (
        <IconButton key={size} size={size}>
          <LlamaIcon />
        </IconButton>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available sizes',
      },
    },
  },
}

export const AllColors: Story = {
  render: () => (
    <Stack direction="row" gap={2} alignItems="center">
      {colors.map((color) => (
        <IconButton key={color} color={color} size="small">
          <LlamaIcon />
        </IconButton>
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available colors',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <LlamaIcon />,
  },
}

export const RotatedIcon: Story = {
  render: () => (
    <Stack direction="row" gap={2} alignItems="center">
      <IconButton>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton>
        <ChevronLeftIcon sx={{ transform: 'rotate(180deg)' }} />
      </IconButton>
    </Stack>
  ),
}

export const WithHeartIcon: Story = {
  args: {
    children: (
      <Stack direction="row" gap={1}>
        <FavoriteHeartIcon isFavorite={false} />
        <FavoriteHeartIcon isFavorite={true} />
      </Stack>
    ),
  },
}

export default meta
