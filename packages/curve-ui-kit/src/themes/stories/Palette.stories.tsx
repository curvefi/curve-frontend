import Switch from '@mui/material/Switch'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { PaletteOptions } from '@mui/material/styles/createPalette'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'

type Palette = keyof PaletteOptions

const PaletteStory = ({ palette }: { palette: Palette }) => {
  const options: Record<string, string> = useTheme().palette[palette]
  return Object.entries(options).map(([key, color]) => (
    <Box>
      <Box>{key}</Box>
      <Box width="50%" height={100} bgcolor={color} />
    </Box>
  ))
}

const options: Palette[] = [
  'neutral',
  'primary',
  'secondary',
  'tertiary',
  'error',
  'warning',
  'info',
  'success',
  'text',
  'background',
  'grey',
  'green',
  'red',
  'blue',
  'violet',
]

const meta: Meta<typeof PaletteStory> = {
  title: 'UI Kit/Primitives/Palette',
  component: PaletteStory,
  argTypes: {
    palette: {
      control: 'select',
      options,
      description: 'The palette',
    },
  }
}

type Story = StoryObj<typeof PaletteStory>

export const stories: Story[] = options.map(
  (palette) => ({
    args: { palette },
    storyName: palette,
  })
)

export default meta
