import Alert, { AlertProps } from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'

const alertAction = (
  <Button color="ghost" size="extraSmall">
    More
  </Button>
)

const AlertStory = (props: AlertProps) => (
  <Stack spacing={5}>
    <Alert severity="success" action={alertAction} {...props}>
      <AlertTitle>Success</AlertTitle>A success text message is displayed. A little llama is happy 😊
    </Alert>
    <Alert severity="info" action={alertAction} {...props}>
      <AlertTitle>Info</AlertTitle>A info text message is displayed. A little llama is curious 🤔
    </Alert>
    <Alert severity="warning" action={alertAction} {...props}>
      <AlertTitle>Warning</AlertTitle>A warning text message is displayed. A little llama is cautious 🦙.
    </Alert>
    <Alert severity="error" action={alertAction} {...props}>
      <AlertTitle>Error</AlertTitle>
      An error text message is displayed. A little llama is very sad 😔
    </Alert>
  </Stack>
)

const meta: Meta<typeof AlertStory> = {
  title: 'UI Kit/Primitives/Alert',
  component: AlertStory,
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined', undefined],
      description: 'The variant of the component',
    },
  },
}

type Story = StoryObj<typeof AlertStory>

export const Filled: Story = { args: { variant: 'filled' } }
export const Outlined: Story = { args: { variant: 'outlined' } }
export const Standard: Story = { args: { variant: 'standard' } }

export default meta
