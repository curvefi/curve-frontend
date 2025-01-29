import CheckIcon from '@mui/icons-material/Check'
import type { Meta, StoryObj } from '@storybook/react'
import Chip, { ChipProps } from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { fn } from '@storybook/test'

type ChipStoryProps = {
  variant: ChipProps['variant']
  color: ChipProps['color']
}

const sizes = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'] satisfies ChipProps['size'][]

const ChipStories = ({ color, variant }: ChipStoryProps) => (
  <Stack spacing={5} flexGrow={0}>
    <Typography variant="headingXxl">
      {color} {variant}s
    </Typography>
    {sizes.map((size) => (
      <Box key={size} display="flex" flexDirection="row" gap={5} justifyContent="space-between">
        <Chip label={size} size={size} color={color} variant={variant} clickable={variant === 'chip'} />
        <Chip
          label={size}
          size={size}
          color={color}
          variant={variant}
          icon={<CheckIcon />}
          clickable={variant === 'chip'}
        />
        {variant === 'chip' && (
          <Chip
            label={size}
            size={size}
            color={color}
            variant={variant}
            icon={<CheckIcon />}
            clickable={variant === 'chip'}
            onDelete={fn()}
          />
        )}
      </Box>
    ))}
  </Stack>
)

const meta: Meta<typeof ChipStories> = {
  title: 'UI Kit/Primitives/Chips and loose badges',
  component: ChipStories,
  argTypes: {},
}

export const AlertBadge: StoryObj<typeof ChipStories> = { args: { variant: 'badge', color: 'alert' } }
export const DefaultBadge: StoryObj<typeof ChipStories> = { args: { variant: 'badge', color: 'default' } }
export const ActiveBadge: StoryObj<typeof ChipStories> = { args: { variant: 'badge', color: 'active' } }
export const HighlightBadge: StoryObj<typeof ChipStories> = { args: { variant: 'badge', color: 'highlight' } }
export const WarningBadge: StoryObj<typeof ChipStories> = { args: { variant: 'badge', color: 'warning' } }
export const AccentBadge: StoryObj<typeof ChipStories> = { args: { variant: 'badge', color: 'accent' } }

export const InactiveChip: StoryObj<typeof ChipStories> = { args: { variant: 'chip', color: 'inactive' } }
export const ActiveChip: StoryObj<typeof ChipStories> = { args: { variant: 'chip', color: 'highlight' } }

export default meta
