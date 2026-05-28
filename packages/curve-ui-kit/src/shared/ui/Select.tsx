// eslint-disable-next-line no-restricted-imports
import MuiSelect, { type SelectProps as MuiSelectProps } from '@mui/material/Select'
import type { Theme } from '@mui/material/styles'
import { Transparent } from '@ui-kit/themes/design/0_primitives'
import { applySxProps } from '@ui-kit/utils'

const ghostSx = {
  '&.MuiInputBase-root': { backgroundColor: Transparent },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: Transparent, backgroundColor: Transparent },
  '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled)': {
    backgroundColor: Transparent,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: (theme: Theme) => theme.design.InputSelect.Base.Default.Border.Hover,
    },
  },
  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: Transparent },
} as const

export type SelectProps = Omit<MuiSelectProps, 'variant'> & {
  variant?: MuiSelectProps['variant'] | 'ghost'
}

/**
 * Wrapper component for Mui's Select component that adds additional functionality, like a ghost variant
 *
 * Mui does not allow us to override the variants (it's not an interface extendable via mui-select.d.ts but a normal type).
 */
export const Select = ({ sx, variant, ...props }: SelectProps) => (
  <MuiSelect
    variant={variant === 'ghost' ? 'outlined' : variant}
    sx={applySxProps(variant === 'ghost' && ghostSx, sx)}
    {...props}
  />
)
