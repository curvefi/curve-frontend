import { useRef } from 'react'
import type { AriaNumberFieldProps } from 'react-aria'
import { useLocale, useNumberField } from 'react-aria'
import { useNumberFieldState } from 'react-stately'
import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'

interface Props extends AriaNumberFieldProps {
  row?: boolean
  description?: string
  className?: string
}

export const NumberField = (props: Props) => {
  const { label, minValue = 0, maxValue = Infinity } = props
  const { locale } = useLocale()
  const state = useNumberFieldState({ ...props, locale, minValue, maxValue })
  const inputRef = useRef(null)
  const { labelProps, groupProps, inputProps } = useNumberField(props, state, inputRef)

  return (
    <InputWrapper className={props.className} isRow={props.row !== undefined}>
      <Box flex flexAlignItems="center">
        <label {...labelProps}>{label}</label>
        {props.description && (
          <StyledIconTooltip customIcon={<StyledIcon name="InformationSquare" size={16} />} placement="bottom">
            {props.description}
          </StyledIconTooltip>
        )}
      </Box>
      <div {...groupProps}>
        <StyledInput {...inputProps} ref={inputRef} />
      </div>
    </InputWrapper>
  )
}

const InputWrapper = styled.div<{ isRow: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.isRow ? 'calc(50% - var(--spacing-2))' : '100%')};
  label {
    margin: var(--spacing-narrow) var(--spacing-1) var(--spacing-2) var(--spacing-2);
    font-size: var(--font-size-2);
    color: var(--box--primary--color);
  }
`

const StyledInput = styled.input`
  padding: var(--spacing-2) var(--spacing-narrow);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  color: var(--page--text-color);
  border: 1px solid var(--page--text-color);
  background-color: var(--dialog--background-color);
  box-shadow: inset 0.5px 0.5px 0 0.5px var(--input--border-color);
  cursor: pointer;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  &:focus-visible {
    outline: var(--button_text--hover--color) auto 2px;
  }
`

const StyledIconTooltip = styled(IconTooltip)`
  margin-top: auto;
`

const StyledIcon = styled(Icon)`
  color: var(--box--primary--color);
  opacity: 0.4;
  margin-top: var(--spacing-2);
`
