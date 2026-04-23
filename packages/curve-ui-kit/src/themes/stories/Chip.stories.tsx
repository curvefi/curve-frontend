import { fn } from 'storybook/test'
import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type SelectableChipProps, SelectableChip } from '@ui-kit/shared/ui/SelectableChip'

type ChipStoryProps = {
  color: 'selected' | 'unselected'
  variant?: SelectableChipProps['variant']
}

const sizes = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'] satisfies SelectableChipProps['size'][]

const ChipStories = ({ color, variant }: ChipStoryProps) => (
  <Stack spacing={7} flexGrow={0} marginBlock={9}>
    <Typography variant="headingXxl">Chips: {color} color</Typography>
    {sizes.map((size) => (
      <Box key={size} display="flex" flexDirection="row" gap={5} justifyContent="space-evenly">
        {/* simple one */}
        <SelectableChip label={size} size={size} selected={color === 'selected'} toggle={fn()} variant={variant} />

        {/* with icon */}
        <SelectableChip
          label={size}
          size={size}
          color={color}
          icon={<CheckIcon />}
          selected={color === 'selected'}
          toggle={fn()}
          variant={variant}
        />

        {/* only icon */}
        <SelectableChip
          size={size}
          color={color}
          icon={<CheckIcon />}
          selected={color === 'selected'}
          toggle={fn()}
          variant={variant}
        />

        {/* with icon and delete icon */}
        <SelectableChip
          label={size}
          size={size}
          color={color}
          icon={<CheckIcon />}
          selected={color === 'selected'}
          toggle={fn()}
          onDelete={fn()}
          variant={variant}
        />
      </Box>
    ))}
  </Stack>
)

const meta: Meta<typeof ChipStories> = {
  title: 'UI Kit/Primitives/Chips',
  component: ChipStories,
  argTypes: {
    color: {
      control: 'select',
      options: ['selected', 'unselected'],
      description: 'The color of the component',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: 'The variant of the component (not used)',
    },
  },
}

export const UnselectedChip: StoryObj<typeof ChipStories> = { args: { color: 'unselected' } }
export const SelectedChip: StoryObj<typeof ChipStories> = { args: { color: 'selected' } }

export default meta
