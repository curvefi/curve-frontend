import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper, { type StepperProps } from '@mui/material/Stepper'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces
const labels = ['Tokens', 'Pool type', 'Parameters', 'Initial liquidity', 'Name and symbol']

const StepperStory = (props: StepperProps) => (
  <Stepper {...props}>
    {labels.map(label => (
      <Step key={label}>
        <StepLabel>{label}</StepLabel>
      </Step>
    ))}
  </Stepper>
)

const meta: Meta<typeof Stepper> = {
  title: 'UI/Components/Stepper',
  component: Stepper,
  globals: { theme: 'chad' },
  args: { activeStep: 0 },
  render: args => <StepperStory {...args} />,
}

type Story = StoryObj<typeof Stepper>

export const States: Story = {
  render: args => (
    <Stack direction="row" sx={{ gap: Spacing.xxl, padding: Spacing.xl, flexWrap: 'wrap' }}>
      <StepperStory {...args} />
      <Stepper activeStep={3} nonLinear>
        {labels.map((label, index) => (
          <Step key={label} completed={index !== 3}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <StepperStory activeStep={labels.length} />
    </Stack>
  ),
}

export const Default: Story = {}
export const InProgress: Story = { args: { activeStep: 3 } }
export const Completed: Story = { args: { activeStep: labels.length } }

export default meta
