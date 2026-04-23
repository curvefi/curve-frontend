import CheckIcon from '@mui/icons-material/Check'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type BadgeProps, Badge } from '@ui-kit/shared/ui/Badge'

type BadgeStoryProps = {
  color: BadgeProps['color']
  variant?: BadgeProps['variant']
}

const sizes = ['extraSmall', 'small', 'medium', 'large', 'extraLarge'] satisfies BadgeProps['size'][]

const BadgeStories = ({ color, variant }: BadgeStoryProps) => (
  <Stack spacing={7} flexGrow={0} marginBlock={9}>
    <Typography variant="headingXxl">Badges: {color} color</Typography>
    {sizes.map((size) => (
      <Box key={size} display="flex" flexDirection="row" gap={5} justifyContent="space-evenly">
        {/* simple one */}
        <Badge label={size} size={size} color={color} variant={variant} />

        {/* with icon */}
        <Badge label={size} size={size} color={color} icon={<CheckIcon />} variant={variant} />

        {/* only icon */}
        <Badge size={size} color={color} icon={<CheckIcon />} variant={variant} />
      </Box>
    ))}
  </Stack>
)

const meta: Meta<typeof BadgeStories> = {
  title: 'UI Kit/Primitives/Badges',
  component: BadgeStories,
  argTypes: {
    color: {
      control: 'select',
      options: ['alert', 'default', 'active', 'highlight', 'warning', 'accent'],
      description: 'The color of the component',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: 'The variant of the component (not used)',
    },
  },
}

export const AlertBadge: StoryObj<typeof BadgeStories> = { args: { color: 'alert' } }
export const DefaultBadge: StoryObj<typeof BadgeStories> = { args: { color: 'default' } }
export const ActiveBadge: StoryObj<typeof BadgeStories> = { args: { color: 'active' } }
export const HighlightBadge: StoryObj<typeof BadgeStories> = { args: { color: 'highlight' } }
export const WarningBadge: StoryObj<typeof BadgeStories> = { args: { color: 'warning' } }
export const AccentBadge: StoryObj<typeof BadgeStories> = { args: { color: 'accent' } }

export default meta
