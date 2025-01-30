import CheckIcon from '@mui/icons-material/Check'
import type { Meta, StoryObj } from '@storybook/react'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { fn } from '@storybook/test'
import type { ChipProps } from '@mui/material/Chip'

type ChipStoryProps = {
  color: ChipProps['color']
  clickable: boolean
  variant?: ChipProps['variant']
}

const sizes = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'] satisfies ChipProps['size'][]

const ChipStories = ({ clickable, color, variant }: ChipStoryProps) => (
  <Stack spacing={6} flexGrow={0} marginBlock={8}>
    <Typography variant="headingXxl">
      {clickable ? 'Chips' : 'Badges'}: {color} color
    </Typography>
    {sizes.map((size) => (
      <Box key={size} display="flex" flexDirection="row" gap={5} justifyContent="space-evenly">
        {/* simple one */}
        <Chip label={size} size={size} color={color} clickable={clickable} variant={variant} />

        {/* with icon */}
        <Chip label={size} size={size} color={color} icon={<CheckIcon />} clickable={clickable} variant={variant} />

        {/* with icon and delete icon only for clickable chips */}
        {clickable && (
          <Chip
            label={size}
            size={size}
            color={color}
            icon={<CheckIcon />}
            clickable
            onDelete={fn()}
            variant={variant}
          />
        )}
      </Box>
    ))}
  </Stack>
)

const meta: Meta<typeof ChipStories> = {
  title: 'UI Kit/Primitives/Chips and loose badges',
  component: ChipStories,
  argTypes: {
    clickable: {
      control: 'boolean',
      description: 'Whether the chip is clickable',
    },
    color: {
      control: 'select',
      options: ['alert', 'default', 'active', 'highlight', 'warning', 'accent', 'inactive'],
      description: 'The color of the component',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: 'The variant of the component (not used)',
    },
  },
  args: {
    clickable: false,
  },
}

export const AlertBadge: StoryObj<typeof ChipStories> = { args: { color: 'alert' } }
export const DefaultBadge: StoryObj<typeof ChipStories> = { args: { color: 'default' } }
export const ActiveBadge: StoryObj<typeof ChipStories> = { args: { color: 'active' } }
export const HighlightBadge: StoryObj<typeof ChipStories> = { args: { color: 'highlight' } }
export const WarningBadge: StoryObj<typeof ChipStories> = { args: { color: 'warning' } }
export const AccentBadge: StoryObj<typeof ChipStories> = { args: { color: 'accent' } }

export const InactiveChip: StoryObj<typeof ChipStories> = { args: { clickable: true, color: 'inactive' } }
export const HighlightChip: StoryObj<typeof ChipStories> = { args: { clickable: true, color: 'highlight' } }

export default meta
