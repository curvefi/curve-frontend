import { type ChangeEvent, type ComponentProps, useState } from 'react'
import { fn } from 'storybook/test'
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SliderInput } from '@ui-kit/shared/ui/SliderInput'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils/number'
import { CheckboxField } from '@ui-kit/widgets/DetailPageLayout/CheckboxField'

const { MaxWidth, Spacing } = SizesAndSpaces

type CheckboxFieldStoryProps = Omit<ComponentProps<typeof CheckboxField>, 'checked' | 'onChange'> & {
  checked?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

const CheckboxFieldStory = ({ checked: initialChecked = false, onChange, ...props }: CheckboxFieldStoryProps) => {
  const [checked, setChecked] = useState(initialChecked)

  return (
    <Box sx={{ width: MaxWidth.actionCard }}>
      <CheckboxField
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
        name="stake-slider"
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

const meta: Meta<typeof CheckboxFieldStory> = {
  title: 'UI Kit/Widgets/CheckboxField',
  component: CheckboxFieldStory,
  args: {
    checked: true,
    label: `Enable leverage`,
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
    disabled: {
      control: 'boolean',
      description: 'Disables the checkbox input.',
    },
    endContent: {
      control: { disable: true },
      description: 'Supplementary content (e.g., preview value, settings) displayed at the end of the checkbox row.',
    },
    collapsible: {
      control: { disable: true },
      description: 'Collapsible content rendered when the checkbox is checked.',
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
          'CheckboxField wraps MUI Checkbox with label, helper text, and optional right-side content plus collapsible children.',
      },
    },
  },
}

type Story = StoryObj<typeof CheckboxFieldStory>

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Simple checkbox with label.',
      },
    },
  },
}

export const WithEndContent: Story = {
  args: {
    endContent: (
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
        story: 'Checkbox with supplementary end content.',
      },
    },
  },
}

export const WithCollapsibleChildren: Story = {
  args: {
    label: 'Deposit and stake',
    collapsible: <SliderContent />,
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
