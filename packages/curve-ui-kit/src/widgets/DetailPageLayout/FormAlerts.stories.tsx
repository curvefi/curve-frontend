import { range } from '@primitives/objects.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormAlerts } from './FormAlerts'

const LONG_ERROR = new Error(
  range(20)
    .map(index => `Transaction error detail ${index}: reverted call data 0x${index.toString(16).padStart(8, '0')}`)
    .join(' '),
)

const meta: Meta<typeof FormAlerts> = {
  title: 'UI Kit/Widgets/Detail Page/Form Alerts',
  component: FormAlerts,
  args: { formErrors: [], handledErrors: [] },
  decorators: [Story => <div style={{ width: 'min(480px, 100vw)' }}>{Story()}</div>],
}

type Story = StoryObj<typeof FormAlerts>

export const Default: Story = {
  args: { error: new Error('Transaction reverted') },
}

export const ValidationErrors: Story = {
  args: {
    formErrors: [
      ['collateral', 'Collateral amount exceeds your balance'],
      ['debt', 'Debt amount is below the minimum'],
    ],
  },
}

export const RejectedTransaction: Story = {
  args: { error: new Error('User rejected the request') },
}

export const LongSubmissionError: Story = {
  args: { error: LONG_ERROR },
}

export const ValidationAndSubmissionErrors: Story = {
  args: {
    error: new Error('Unable to estimate gas'),
    formErrors: [['debt', 'Enter a valid debt amount']],
  },
}

export default meta
