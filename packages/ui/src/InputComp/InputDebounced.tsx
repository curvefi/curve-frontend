import type { InputLabelProps, InputProps } from './types'

import React from 'react'

import { useInputContext } from 'ui/src/InputComp/InputProvider'
import useDebounceValue from 'ui/src/hooks/useDebouncedValue'

import Box from 'ui/src/Box/Box'
import Input from 'ui/src/InputComp/Input'
import InputLabel from 'ui/src/InputComp/InputLabel'

const InputDebounced = ({
  className,
  delay,
  disabled,
  labelProps,
  value,
  onChange,
  testId,
  ...inputProps
}: Omit<InputProps, 'onChange'> & {
  className?: string
  delay: number
  labelProps?: InputLabelProps | false
  value: string
  testId?: string
  onChange: (value: string) => void
}) => {
  const { disabled: contextDisabled } = useInputContext()
  const [debouncedValue, handleInputChange] = useDebounceValue(value, delay, onChange)

  return (
    <Box grid>
      {labelProps && <InputLabel {...labelProps} testId={testId} />}
      <Input
        value={debouncedValue}
        onChange={handleInputChange}
        disabled={contextDisabled || disabled}
        testId={testId}
        {...inputProps}
      />
    </Box>
  )
}

InputDebounced.displayName = 'InputDebounced'

export default InputDebounced
