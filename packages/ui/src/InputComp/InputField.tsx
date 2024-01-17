import type { InputLabelProps, InputProps } from 'ui/src/InputComp/types'

import * as React from 'react'
import styled from 'styled-components'

import Box from 'ui/src/Box/Box'
import Input from 'ui/src/InputComp/Input'
import InputLabel from 'ui/src/InputComp/InputLabel'
import InputMessage from 'ui/src/InputComp/InputMessage'

const InputField = ({
  className,
  labelProps,
  message,
  testId,
  onChange,
  ...inputProps
}: Omit<InputProps, 'onChange'> & {
  className?: string
  labelProps: InputLabelProps
  message?: string
  testId?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}) => {
  return (
    <>
      <Box className={className}>
        <InputLabel {...labelProps} testId={testId} />
        <StyledInput {...inputProps} testId={testId} onChange={onChange} />
      </Box>
      {message && <InputMessage message={message} />}
    </>
  )
}

const StyledInput = styled(Input)`
  height: 100%;
`

InputField.defaultProps = {
  className: '',
}

InputField.displayName = 'InputField'

export default InputField
