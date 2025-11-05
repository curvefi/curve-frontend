import { fn } from 'storybook/test'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronLeftIcon } from '@ui-kit/shared/icons/ChevronLeftIcon'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'

const meta: Meta<typeof IconButton> = {
  title: 'UI Kit/Primitives/IconButton',
  component: IconButton,
  argTypes: {
    size: {
      control: 'select',
      options: ['extraExtraSmall', 'extraSmall', 'small', 'medium', 'large'],
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
    children: <ChevronLeftIcon />,
  },
}

export const AllSizes: Story = {
  render: () => (
    <Stack direction="row" gap={2} alignItems="center">
      <IconButton size="extraExtraSmall">
        <ChevronLeftIcon />
      </IconButton>
      <IconButton size="extraSmall">
        <ChevronLeftIcon color="error" />
      </IconButton>
      <IconButton size="small">
        <ChevronLeftIcon color="warning" />
      </IconButton>
      <IconButton size="medium">
        <ChevronLeftIcon color="success" />
      </IconButton>
      <IconButton size="large">
        <ChevronLeftIcon />
      </IconButton>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all available sizes and colors',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <ChevronLeftIcon />,
  },
}

export const RotatedIcon: Story = {
  args: {
    children: <ChevronLeftIcon sx={{ transform: 'rotate(180deg)' }} />,
  },
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
