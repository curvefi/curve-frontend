import { type ChangeEvent, type ComponentProps, useState } from 'react'
import { fn } from 'storybook/test'
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Decimal } from '@ui-kit/utils'
import { formatNumber } from '@ui-kit/utils/number'
import { FormCheckbox } from '@ui-kit/widgets/DetailPageLayout/FormCheckbox'

const { MaxWidth, Spacing } = SizesAndSpaces

type FormCheckboxStoryProps = Omit<ComponentProps<typeof FormCheckbox>, 'checked' | 'onChange'> & {
  checked?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

const FormCheckboxStory = ({ checked: initialChecked = false, onChange, ...props }: FormCheckboxStoryProps) => {
  const [checked, setChecked] = useState(initialChecked)

  return (
    <Box sx={{ width: MaxWidth.actionCard }}>
      <FormCheckbox
        {...props}
        checked={checked}
        onChange={(event) => {
          setChecked(event.target.checked)
          onChange?.(event)
        }}
      />
    </Box>
  )
}

const SliderContent = () => {
  const [value, setValue] = useState<Decimal>('50')

  return (
    <Stack sx={{ paddingBlock: Spacing.sm }}>
      <Typography variant="bodySBold">{t`Stake`}</Typography>
      <SliderInput
        value={value}
        min={0}
        max={100}
        step={1}
        onChange={setValue}
        inputProps={{
          format: (value) => formatNumber(Number(value), { abbreviate: true }),
          adornment: 'percentage',
        }}
      />
    </Stack>
  )
}

const meta: Meta<typeof FormCheckboxStory> = {
  title: 'UI Kit/Widgets/FormCheckbox',
  component: FormCheckboxStory,
  args: {
    checked: true,
    label: `Enable leverage`,
    message: `${t`up to`} ${formatNumber(7.5, { decimals: 1, abbreviate: false })}x 🔥`,
    isLoading: false,
    disabled: false,
    onChange: fn(),
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controls the checked state of the checkbox.',
    },
    label: {
      control: 'text',
      description: 'Primary label shown next to the checkbox.',
    },
    message: {
      control: 'text',
      description: 'Helper text rendered under the label.',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows a skeleton placeholder for the message text.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the checkbox input.',
    },
    rightChildren: {
      control: { disable: true },
      description: 'Optional content aligned to the right of the label.',
    },
    children: {
      control: { disable: true },
      description: 'Collapsible content rendered when the checkbox is checked.',
    },
    error: {
      control: { disable: true },
      description: 'Error state that changes the helper message color.',
    },
    onChange: {
      control: { disable: true },
      description: 'Callback fired when the checkbox changes.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'FormCheckbox wraps MUI Checkbox with label, helper text, and optional right-side content plus collapsible children.',
      },
    },
  },
}

type Story = StoryObj<typeof FormCheckboxStory>

export const Basic: Story = {
  args: {
    message: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple checkbox with label.',
      },
    },
  },
}

export const WithMessage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simple checkbox with label and helper message.',
      },
    },
  },
}

export const WithRightChildren: Story = {
  args: {
    rightChildren: (
      <ActionInfo
        label={t`Leverage`}
        value={`${formatNumber(2.42, { decimals: 2, abbreviate: false })}x`}
        size="medium"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with a right-aligned children.',
      },
    },
  },
}

export const WithError: Story = {
  args: {
    error: new Error(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with an error.',
      },
    },
  },
}

export const WithCollapsibleChildren: Story = {
  args: {
    label: 'Deposit and stake',
    message: 'Staking in the gauge enables CRV rewards',
    children: <SliderContent />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with collapsible children when checked.',
      },
    },
  },
}

export default meta
