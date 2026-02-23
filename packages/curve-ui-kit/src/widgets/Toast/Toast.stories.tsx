import { Button, Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { withPendingToast } from '@ui-kit/features/connect-wallet/lib/notify'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Toast } from './Toast'
import { showToast } from './toast.util'

const { Spacing } = SizesAndSpaces

const meta: Meta<typeof Toast> = {
  title: 'UI Kit/Widgets/Toast',
  component: Toast,
  args: { title: 'Toast Title' },
  argTypes: { title: { control: 'text' } },
}

export default meta

type Story = StoryObj<typeof meta>

export const AllSeverities: Story = {
  render: ({ title }) => (
    <Stack spacing={Spacing.sm} direction="row" minHeight={300} minWidth={500} alignContent="end" flexWrap="wrap">
      <Toast />
      <Button
        variant="contained"
        color="success"
        onClick={() => showToast({ message: 'A success message', severity: 'success', title })}
      >
        Success
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => showToast({ message: 'Here is your info toastr', severity: 'info', title })}
      >
        Info
      </Button>
      <Button
        variant="contained"
        color="warning"
        sx={{ color: '#000' }} // warning is not really part of the design system, only used in the story.
        onClick={() => showToast({ message: 'Warning: We are testing', severity: 'warning', title })}
      >
        Warning
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => showToast({ message: 'An error has been simulated', severity: 'error', title })}
      >
        Error
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() =>
          withPendingToast(new Promise((resolve) => setTimeout(() => resolve(null), 30000)), 'This operation takes 30s')
        }
      >
        Pending
      </Button>
    </Stack>
  ),
}
