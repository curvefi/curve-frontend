import type { StepIconProps } from '@mui/material/StepIcon'
import type { Components, TypographyVariantsOptions } from '@mui/material/styles'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import type { DesignSystem } from '@ui/features/themes/design'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { CheckIcon } from '@ui/icons/CheckIcon'

const { Sizing, Spacing, IconSize, FontSize } = SizesAndSpaces

export const defineMuiStepLabel = (
  { Button, Color, Text }: DesignSystem,
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
    iconContainer: ({ ownerState: { children } }) => ({
      ...handleBreakpoints({
        width: Sizing.sm,
        height: Sizing.sm,
        marginRight: children ? Spacing.sm : 0, // Only add spacing when a label follows the icon.
        fontSize: FontSize.sm,
      }),
      fontWeight: typography.bodySBold?.fontWeight,
      padding: 0,
      justifyContent: 'center',
      alignItems: 'center',
      color: Button.Primary.Disabled.Label,
      backgroundColor: Button.Primary.Disabled.Fill,
      '&.Mui-active': {
        color: Button.Primary.Default.Label,
        backgroundColor: Color.Primary[500],
        outline: `${Button.Focus_Outline_Width} solid ${Color.Primary[500]}`,
        outlineOffset: Button.Focus_Outline_Width,
      },
      '&.Mui-completed': { color: Button.Success.Default.Label, backgroundColor: Button.Success.Default.Fill },
    }),
    // Hide MUI's empty label container so steps without text keep their icons centered.
    labelContainer: ({ ownerState }) => ({ display: ownerState.children || ownerState.optional ? undefined : 'none' }),
    label: {
      ...typography.bodyMBold,
      color: Text.TextColors.Secondary,
      '&.Mui-active, &.Mui-completed': { ...typography.bodyMBold, color: Text.TextColors.Primary },
    },
  },
})

export const defineMuiStepConnector = ({ Button, Color, Layer }: DesignSystem): Components['MuiStepConnector'] => ({
  styleOverrides: {
    horizontal: { ...handleBreakpoints({ minWidth: Sizing.xs }) },
    vertical: {
      display: 'flex',
      justifyContent: 'center',
      marginLeft: 0,
      ...handleBreakpoints({ width: Sizing.sm, marginBlock: Spacing.xs }),
      '& .MuiStepConnector-line': { ...handleBreakpoints({ minHeight: Sizing.xs }) },
    },
    root: {
      '&.Mui-completed .MuiStepConnector-line': { borderColor: Button.Success.Default.Fill },
      '&.Mui-active .MuiStepConnector-line': { borderColor: Color.Primary[500] },
    },
    line: { borderColor: Layer[3].Outline },
  },
})
