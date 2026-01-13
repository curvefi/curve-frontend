import { CSSProperties, ReactNode, useRef } from 'react'
import { type AriaSelectOptions, HiddenSelect, useSelect, type AriaSelectProps } from 'react-aria'
import type { SelectProps as ReactStatelySelectProps } from 'react-stately'
import { useSelectState } from 'react-stately'
import { styled } from 'styled-components'
import { Icon } from '@ui/Icon/Icon'
import { SelectBtn } from '@ui/Select/SelectBtn'
import { SelectModal } from '@ui/Select/SelectModal'
import { SelectModalFull } from '@ui/Select/SelectModalFull'
import { getIsFullScreen } from '@ui/utils'

export interface SelectProps<T extends object>
  extends Omit<ReactStatelySelectProps<T>, 'children'>, AriaSelectOptions<T> {
  buttonStyles?: CSSProperties
  className?: string
  loading?: boolean
  minWidth?: string
  noLabelChange?: boolean // do not update label to select key
  mobileRightAlign?: boolean // right align dropdown list on small width
  selectedItemLabel?: ReactNode // selected button label that is different from list
  onSelectionDelete?: () => void
  selectSearchOptions?: {
    searchFilterKeys: string[]
  }
  children?: AriaSelectProps<T>['children'] // todo: children is excluded from AriaSelectOptions for some reason, does this even work?
}

export function Select<T extends object>({
  buttonStyles = {},
  noLabelChange,
  onSelectionDelete,
  selectSearchOptions,
  ...props
}: SelectProps<T>) {
  const state = useSelectState(props)
  const buttonRef = useRef<HTMLButtonElement>(null)
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
