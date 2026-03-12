// eslint-disable-next-line no-restricted-imports
import MuiSelect, { type SelectProps as MuiSelectProps } from '@mui/material/Select'
import { applySxProps } from '@ui-kit/utils'

const ghostSx = {
  '&.MuiInputBase-root': { backgroundColor: 'transparent' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent', backgroundColor: 'transparant' },
  '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
} as const

type SelectProps = Omit<MuiSelectProps, 'variant'> & {
  variant?: MuiSelectProps['variant'] | 'ghost'
}

/** Wrapper component for Mui's Select component that adds additional functionality, like a ghost variant */
export const Select = ({ sx, variant, ...props }: SelectProps) => (
  <MuiSelect
    variant={variant === 'ghost' ? 'outlined' : variant}
    sx={applySxProps(variant === 'ghost' && ghostSx, sx)}
    {...props}
  />
)

export type { MuiSelectProps as SelectProps }
