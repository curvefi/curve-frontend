import type { StepIconProps } from '@mui/material/StepIcon'
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import type { DesignSystem } from '@ui/features/themes/design'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CheckIcon } from '@ui/icons/CheckIcon'

const { Sizing, Spacing, IconSize, FontSize } = SizesAndSpaces

export const defineMuiStepLabel = (
  { Button, Text }: DesignSystem,
  typography: TypographyVariantsOptions,
): Components['MuiStepLabel'] => ({
  defaultProps: {
    slots: {
      stepIcon: ({ completed, icon }: StepIconProps) =>
        completed ? <CheckIcon titleAccess="Completed" sx={{ fontSize: IconSize.sm }} /> : <>{icon}</>,
    },
  },
  styleOverrides: {
    root: { padding: 0 },
    iconContainer: {
      ...handleBreakpoints({ width: Sizing.sm, height: Sizing.sm, marginRight: Spacing.sm, fontSize: FontSize.sm }),
      fontWeight: typography.bodySBold?.fontWeight,
      padding: 0,
      justifyContent: 'center',
      alignItems: 'center',
      color: Button.Primary.Disabled.Label,
      backgroundColor: Button.Primary.Disabled.Fill,
      ...Object.fromEntries(
        Object.entries({ active: Button.Primary.Default, completed: Button.Success.Default }).map(
          ([state, { Label, Fill }]) => [`&.Mui-${state}`, { color: Label, backgroundColor: Fill }],
        ),
      ),
    },
    label: {
      ...typography.bodyMBold,
      color: Text.TextColors.Secondary,
      '&.Mui-active, &.Mui-completed': { ...typography.bodyMBold, color: Text.TextColors.Primary },
    },
  },
})

export const defineMuiStepConnector = ({ Button, Layer }: DesignSystem): Components['MuiStepConnector'] => ({
  styleOverrides: {
    vertical: {
      display: 'flex',
      justifyContent: 'center',
      marginLeft: 0,
      ...handleBreakpoints({ width: Sizing.sm, marginBlock: Spacing.xs }),
      '& .MuiStepConnector-line': { ...handleBreakpoints({ minHeight: Sizing.xs }) },
    },
    root: {
      '&.Mui-active .MuiStepConnector-line, &.Mui-completed .MuiStepConnector-line': {
        borderColor: Button.Success.Default.Fill,
      },
    },
    line: { borderColor: Layer[3].Outline },
  },
})
