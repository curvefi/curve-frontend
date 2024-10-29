import { Divider, Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { figmaTokens } from '../../../api'
import { Typography } from '../Typography'
import { typographyVariantsKeys, TypographyVariantKey } from '../variants'

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

const TypographyDisplay: React.FC<TypographyDisplayProps> = ({ variant, ...args }) => {
  const typography = figmaTokens.typography[variant]

  return (
    <Stack spacing={1}>
      <Typography {...args} variant={variant}>
        {args.children}
      </Typography>
      <Divider />
      <Typography variant="bodyXsRegular">
        Variant: <Typography variant="highLightedXs">{variant}</Typography>
      </Typography>
      {typography?.description && (
        <Typography variant="bodyXsRegular">Description: {typography.description}</Typography>
      )}
    </Stack>
  )
}

const createStory = (categoryKey: keyof typeof typographyVariantsKeys): Story => ({
  decorators: [
    (Story, { args }) => {
      const variants = typographyVariantsKeys[categoryKey]

      return (
        <Stack spacing={5}>
          {(Array.isArray(variants) ? variants : Object.values(variants).flat()).map((variant) => (
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
export const Highlighted = createStory('highlighted')

export default meta
