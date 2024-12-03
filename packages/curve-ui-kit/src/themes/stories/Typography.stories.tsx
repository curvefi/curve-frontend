import { Divider, Stack, Typography, List, ListItem } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { TYPOGRAPHY_VARIANTS, TypographyVariantKey } from '../typography'
import { ReactNode } from 'react'

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
    children: 'The quick brown fox jumps over the lazy dog. While the dog is sleeping, the fox is running.',
  },
}

type Story = StoryObj<typeof Typography>

interface TypographyDisplayProps {
  variant: TypographyVariantKey
  [key: string]: any
}

const Item = ({title, value}:{ title: string, value: ReactNode }) => value && (
  <ListItem>
    <Typography variant="headingXsBold">{title}: &nbsp;</Typography>
    <Typography variant="headingXsMedium">{value}</Typography>
  </ListItem>
)

const TypographyDisplay: React.FC<TypographyDisplayProps> = ({ variant, children, ...args }) => {
  const { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } = TYPOGRAPHY_VARIANTS[variant]
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
          <Item title="Font Size" value={fontSize} />
          <Item title="Line Height" value={lineHeight} />
          <Item title="Letter Spacing" value={letterSpacing} />
        </List>
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
            ),
          )}
        </Stack>
      )
    },
  ],
})

export const Heading = createStory('heading')
export const Body = createStory('body')
export const Button = createStory('button')
export const Table = createStory('table')
export const Highlight = createStory('highlight')

export default meta
