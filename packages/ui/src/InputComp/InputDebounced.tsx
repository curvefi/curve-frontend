import { useDebounce } from 'curve-ui-kit/src/hooks/useDebounce'
import Box from 'ui/src/Box/Box'
import { InputLabel } from 'ui/src/InputComp'
import Input from 'ui/src/InputComp/Input'
import { useInputContext } from 'ui/src/InputComp/InputProvider'
import type { InputLabelProps, InputProps } from './types'

const InputDebounced = ({
  className,
  delay = 700,
  disabled,
  labelProps,
  value,
  onChange,
  testId,
  ...inputProps
}: Omit<InputProps, 'onChange'> & {
  className?: string
  delay?: number
  labelProps?: InputLabelProps | false
  value: string
  testId?: string
  onChange: (value: string) => void
}) => {
  const { disabled: contextDisabled } = useInputContext()
  const [debouncedValue, handleInputChange] = useDebounce(value, delay, onChange)

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

export default InputDebounced
