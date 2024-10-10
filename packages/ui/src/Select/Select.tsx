import type { AriaSelectOptions } from 'react-aria'
import type { SelectProps as ReactStatelySelectProps } from 'react-stately'

import * as React from 'react'
import { HiddenSelect, useSelect } from 'react-aria'
import { useSelectState } from 'react-stately'
import styled from 'styled-components'

import { getIsFullScreen } from 'ui/src/utils'
import Icon from 'ui/src/Icon/Icon'
import SelectBtn from 'ui/src/Select/SelectBtn'
import SelectIconBtnDelete from 'ui/src/Select/SelectIconBtnDelete'
import SelectModal from 'ui/src/Select/SelectModal'
import SelectModalFull from 'ui/src/Select/SelectModalFull'

export interface SelectProps<T extends object>
  extends Omit<ReactStatelySelectProps<T>, 'children'>,
    AriaSelectOptions<T> {
  buttonStyles?: React.CSSProperties
  className?: string
  loading?: boolean
  minWidth?: string
  noLabelChange?: boolean // do not update label to select key
  mobileRightAlign?: boolean // right align dropdown list on small width
  selectedItemLabel?: string | React.ReactNode // selected button label that is different from list
  onSelectionDelete?: () => void
  selectSearchOptions?: {
    searchFilterKeys: string[]
  }
}

function Select<T extends object>({
  buttonStyles = {},
  noLabelChange,
  onSelectionDelete,
  selectSearchOptions,
  ...props
}: SelectProps<T>) {
  const state = useSelectState(props)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const { labelProps, triggerProps, menuProps } = useSelect(props, state, buttonRef)

  const title = props['aria-label'] || 'Select'
  const selectListIsGreaterThanOne = [...(props.items ?? [])].length > 1

  return (
    <Wrapper className={props.className}>
      <div {...labelProps}>{props.label}</div>
      <HiddenSelect state={state} triggerRef={buttonRef} label={props.label} name={props.name} />
      <InnerWrapper>
        <SelectBtn
          {...triggerProps}
          isDisabled={triggerProps.isDisabled || !selectListIsGreaterThanOne || props.loading}
          style={buttonStyles}
          loading={props.loading}
          buttonRef={buttonRef}
        >
          {noLabelChange ? title : state.selectedItem ? props.selectedItemLabel || state.selectedItem.rendered : title}
          {!onSelectionDelete && (
            <StyledIcon
              name="CaretDown"
              $hideIcon={!selectListIsGreaterThanOne}
              size={16}
              aria-hidden="true"
              aria-label="select"
            />
          )}
        </SelectBtn>

        {onSelectionDelete && <SelectIconBtnDelete loading={props.loading} onSelectionDelete={onSelectionDelete} />}
      </InnerWrapper>
      {state.isOpen && (
        <>
          {getIsFullScreen() ? (
            <SelectModalFull title={title} state={state} onSelectionChange={props.onSelectionChange} />
          ) : (
            <SelectModal
              isOpen
              minWidth={props.minWidth}
              mobileRightAlign={props.mobileRightAlign}
              menuProps={menuProps}
              state={state}
              {...(selectSearchOptions ? { ...selectSearchOptions, onSelectionChange: props.onSelectionChange } : {})}
            />
          )}
        </>
      )}
    </Wrapper>
  )
}

Select.displayName = 'Select'
Select.defaultProps = {
  className: '',
  label: '',
}

const Wrapper = styled.div`
  border: 1px solid var(--button_outlined--border-color);
  display: inline-block;
  height: 100%;
  min-height: var(--height-medium);
  position: relative;
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`

const InnerWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
`

const StyledIcon = styled(Icon)<{ $hideIcon: boolean }>`
  margin-left: 0.25rem;
  ${({ $hideIcon }) => {
    if ($hideIcon) {
      return `
        visibility: hidden;
        width: 0px;
      `
    }
  }}
`

export default Select
