import { useDebounce } from 'curve-ui-kit/src/hooks/useDebounce'
import { Box } from '@ui/Box/Box'
import { InputLabel } from '@ui/InputComp'
import { Input } from '@ui/InputComp/Input'
import { useInputContext } from './InputContext'
import type { InputLabelProps, InputProps } from './types'

export const InputDebounced = ({
  delay = 700,
  disabled,
  labelProps,
  value,
  onChange,
  testId,
  ...inputProps
}: Omit<InputProps, 'onChange'> & {
  delay?: number
  labelProps?: InputLabelProps | false
  value: string
  testId?: string
  onChange: (value: string) => void
}) => {
  const { disabled: contextDisabled } = useInputContext()
  const [debouncedValue, handleInputChange] = useDebounce({
    initialValue: value,
    debounceMs: delay,
    callback: onChange,
  })

  return (
    <Box grid>
      {labelProps && <InputLabel {...labelProps} testId={testId} />}
      <Input
        value={debouncedValue}
        onChange={(e) => handleInputChange(e.target.value)}
        disabled={contextDisabled || disabled}
        testId={testId}
        {...inputProps}
      />
    </Box>
  )
}

InputDebounced.displayName = 'InputDebounced'
