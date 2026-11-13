import { type ReactNode, useId } from 'react'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { fromEntries } from '@primitives/objects.utils'
import { useFormContext, type FormUpdates } from '@ui/features/forms'
import { NumericTextField } from '@ui/features/forms/controls/NumericTextField'
import type { PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { decimal } from '@ui/lib/decimal'
import type { CreatePoolFormValues, PoolParameters } from './types'

/**
 * Binds compact text and numeric inputs to the form, including conversion, labels and field errors.
 * Ideally the text/number components should be children, but I think this solution makes sense to share the error handling.
 **/
export const CreatePoolField = ({
  name,
  inputType,
  label,
  helperText,
  unit,
  disabled,
  placeholder,
  additionalUpdates,
}: {
  label: string
  helperText?: ReactNode
  unit?: string
  disabled: boolean
  placeholder?: string
  additionalUpdates?: FormUpdates<CreatePoolFormValues>
} & (
  | { inputType: 'text'; name: 'poolName' | 'symbol' }
  | { inputType?: 'number'; name: keyof PoolParameters | PoolAmountField }
)) => {
  const id = useId()
  const {
    values,
    update,
    isTouched,
    formState: { errors },
  } = useFormContext<CreatePoolFormValues>()
  const error = isTouched(name) && errors[name]?.message
  const inputProps = { id, size: 'small', variant: 'outlined', error: !!error, disabled, placeholder } as const
  return (
    <FormControl error={!!error} fullWidth>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      {inputType === 'text' ? (
        <TextField
          {...inputProps}
          value={values[name] ?? ''}
          onChange={event => update({ ...additionalUpdates, ...fromEntries([[name, event.target.value]]) })}
        />
      ) : (
        <NumericTextField
          {...inputProps}
          value={values[name]}
          onChange={value => update({ ...additionalUpdates, ...fromEntries([[name, decimal(value)]]) })}
          slotProps={{ input: { endAdornment: unit && <InputAdornment position="end">{unit}</InputAdornment> } }}
        />
      )}
      {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
    </FormControl>
  )
}
