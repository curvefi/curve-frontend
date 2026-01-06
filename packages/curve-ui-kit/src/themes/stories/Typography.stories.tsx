import { ReactNode } from 'react'
import { Divider, List, ListItem, Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TYPOGRAPHY_VARIANTS, TypographyVariantDefinition, TypographyVariantKey } from '../typography'

const meta: Meta<typeof Typography> = {
  title: 'UI Kit/Primitives/Typography',
  component: Typography,
  argTypes: {
    color: {
      control: 'select',
      options: [
        'text.primary',
        'text.secondary',
        'text.tertiary',
        'text.disabled',
        'text.highlight',
        'error.contrastText',
        'info.contrastText',
        'warning.contrastText',
        'success.contrastText',
        'primary',
        'secondary',
        'tertiary',
        'neutral',
        'info',
        'success',
        'error',
        'grey',
        undefined,
      ],
      description: 'The color of the component',
    },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog. While the dog is sleeping, the fox is running.',
  },
}

type Story = StoryObj<typeof Typography>

interface TypographyDisplayProps {
  variant: TypographyVariantKey
  children?: ReactNode
  [key: string]: unknown
}

const Item = ({ title, value }: { title: string; value: ReactNode }) =>
  value && (
    <ListItem>
      <Typography variant="headingXsBold">{title}: &nbsp;</Typography>
      <Typography variant="headingXsMedium">{value}</Typography>
    </ListItem>
  )

const TypographyDisplay = ({ variant, children, ...args }: TypographyDisplayProps) => {
  const { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } = TYPOGRAPHY_VARIANTS[
    variant
  ] as TypographyVariantDefinition
  return (
    <Stack spacing={1}>
      <Typography {...args} variant={variant}>
        {children}
      </Typography>
      <Divider />
      <Typography variant="bodyXsRegular">
        <List>
          <Item title="Variant" value={variant} />
          <Item title="Font Family" value={fontFamily} />
          <Item title="Font Weight" value={fontWeight} />
          <Item title="Font Size" value={(fontSize || 'Medium').toUpperCase()} />
          <Item title="Line Height" value={(lineHeight ?? fontSize).toUpperCase()} />
          <Item title="Letter Spacing" value={letterSpacing} />
        </List>
      </Typography>
    </Stack>
  )
}

const createStory = (category: string): Story => ({
  decorators: [
    (_story, { args }) => (
      <Stack spacing={5}>
        {Object.keys(TYPOGRAPHY_VARIANTS)
          .filter((t) => t.includes(category))
          .map((variant) => (
            <TypographyDisplay {...args} key={variant} variant={variant as TypographyVariantKey} />
          ))}
      </Stack>
    ),
  ],
})

export const Heading = createStory('heading')
export const Body = createStory('body')
export const Button = createStory('button')
export const Table = createStory('table')
export const Highlight = createStory('highlight')

export default meta
