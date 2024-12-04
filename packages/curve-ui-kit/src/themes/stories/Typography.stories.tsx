import { Divider, Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { TYPOGRAPHY_VARIANTS, TypographyVariantKey } from '../typography'

const meta: Meta<typeof Typography> = {
  title: 'UI Kit/Primitives/Typography',
  component: Typography,
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'neutral', 'info', 'success', 'error', 'grey', undefined],
      description: 'The color of the component',
    },
  },
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
}

type Story = StoryObj<typeof Typography>

interface TypographyDisplayProps {
  variant: TypographyVariantKey
  [key: string]: any
}

const TypographyDisplay: React.FC<TypographyDisplayProps> = ({ variant, children, ...args }) => {
  const typography = TYPOGRAPHY_VARIANTS[variant]
  return (
    <Stack spacing={1}>
      <Typography {...args} variant={variant}>
        {children}
      </Typography>
      <Divider />
      <Typography variant="bodyXsRegular">
        Variant: <Typography variant="highLightedXs">{variant}</Typography>
      </Typography>
    </Stack>
  )
}

const createStory = (category: string): Story => ({
  decorators: [
    (Story, { args }) => {
      return (
        <Stack spacing={5}>
          {Object.keys(TYPOGRAPHY_VARIANTS)
            .filter((t) => t.includes(category))
            .map((variant) => (
              <TypographyDisplay {...args} key={variant} variant={variant as TypographyVariantKey} />
            ))}
        </Stack>
      )
    },
  ],
})

export const Heading = createStory('heading')
export const Body = createStory('body')
export const ButtonLabel = createStory('buttonLabel')
export const Table = createStory('table')
export const Value = createStory('value')

export default meta
