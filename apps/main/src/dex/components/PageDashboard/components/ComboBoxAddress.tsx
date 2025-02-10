import type {
  AriaButtonProps,
  AriaListBoxOptions,
  AriaListBoxSectionProps,
  AriaOptionProps,
  AriaOverlayProps,
} from 'react-aria'
import type { ComboBoxStateOptions, ListState } from 'react-stately'
import type { Node } from '@react-types/shared'

import {
  DismissButton,
  FocusScope,
  mergeProps,
  useButton,
  useComboBox,
  useFilter,
  useFocusRing,
  useListBox,
  useListBoxSection,
  useOption,
  useOverlay,
  useSeparator,
} from 'react-aria'
import { useComboBoxState } from 'react-stately'
import styled from 'styled-components'
import React from 'react'

import { breakpoints } from '@ui/utils/responsive'

import Box from '@ui/Box'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import InputProvider from '@ui/InputComp'
import ShadowedBox from '@ui/ShadowedBox'

const Popover = (
  props: React.PropsWithChildren<AriaOverlayProps & { popoverRef: React.RefObject<HTMLDivElement> }>,
) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const { popoverRef = ref, isOpen, onClose, children } = props

  const { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      shouldCloseOnBlur: true,
      isDismissable: true,
    },
    popoverRef,
  )

  return (
    <FocusScope restoreFocus>
      <StyledPopoverWrapper {...overlayProps} ref={popoverRef}>
        {children}
        <DismissButton onDismiss={onClose} />
      </StyledPopoverWrapper>
    </FocusScope>
  )
}

function Option<T extends {}>({ item, state }: AriaOptionProps & { state: ListState<T>; item: Node<T> }) {
  const ref = React.useRef<HTMLLIElement>(null)
  const { optionProps, isFocused } = useOption({ key: item.key }, state, ref)
  const { focusProps } = useFocusRing()

  return (
    <StyledItem {...mergeProps(optionProps, focusProps)} className={isFocused ? 'isFocused' : ''} ref={ref}>
      {item.rendered}
    </StyledItem>
  )
}

function ListBoxSection<T extends {}>({
  section,
  state,
}: AriaListBoxSectionProps & { state: ListState<T>; section: Node<T> }) {
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  })

  const { separatorProps } = useSeparator({ elementType: 'li' })

  return (
    <>
      {section.key !== state.collection.getFirstKey() && <SectionSeparator {...separatorProps} />}
      <li {...itemProps}>
        {section.rendered && <StyledListSection {...headingProps}>{section.rendered}</StyledListSection>}
        <ul {...groupProps}>
          {/* @ts-ignore */}
          {[...section.childNodes].map((node) => (
            <Option key={node.key} item={node} state={state} />
          ))}
        </ul>
      </li>
    </>
  )
}

function ListBox<T extends {}>(
  props: AriaListBoxOptions<T> & { listBoxRef: React.RefObject<HTMLUListElement>; state: ListState<T> },
) {
  const ref = React.useRef<HTMLUListElement>(null)
  const { listBoxRef = ref, state } = props
  const { listBoxProps } = useListBox(props, state, listBoxRef)

  return (
    <StyledList as="ul" {...listBoxProps} ref={listBoxRef}>
      {/* @ts-ignore */}
      {[...state.collection].map((item) => (
        <ListBoxSection key={item.key} section={item} state={state} />
      ))}
    </StyledList>
  )
}

function Button(
  props: AriaButtonProps & { buttonRef: React.RefObject<HTMLButtonElement>; style?: React.CSSProperties },
) {
  const ref = props.buttonRef
  const { buttonProps } = useButton(props, ref)

  return (
    <StyledIconButton {...buttonProps} ref={ref} style={props.style ?? {}}>
      {props.children}
    </StyledIconButton>
  )
}

function ComboBoxAddress<T extends {}>(props: ComboBoxStateOptions<T>) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listBoxRef = React.useRef<HTMLUListElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const { contains } = useFilter({ sensitivity: 'base' })
  const state = useComboBoxState({ ...props, defaultFilter: contains })

  const { buttonProps, inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state,
  )

  return (
    <ComboBoxWrapper>
      <InputProvider grid gridTemplateColumns="1fr auto" padding="0.375rem 0.5rem" id="ctx-wallet-address">
        <Box flex flexColumn flexJustifyContent="space-between">
          <StyledLabel {...labelProps}>{props.label}</StyledLabel>
          <StyledInput id="inp-wallet-address" {...inputProps} ref={inputRef} />
        </Box>
        <Button {...buttonProps} buttonRef={buttonRef}>
          <Icon name="CaretDown" size={16} aria-label="caret down icon" />
        </Button>
      </InputProvider>
      {state.isOpen && (
        <Popover popoverRef={popoverRef} isOpen={state.isOpen} onClose={state.close}>
          <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
        </Popover>
      )}
    </ComboBoxWrapper>
  )
}

const StyledPopoverWrapper = styled.div`
  margin-top: 0.25rem; // 4px
  position: absolute;
  width: 100%;
  z-index: var(--z-index-overlay);

  background: var(--page--background-color);
  border: 1px solid var(--input--border-color);
`

const StyledItem = styled.li`
  padding: 0.375rem 0.5rem; // 6px 8px

  &:hover:not([aria-selected='true']),
  &.isFocused {
    color: var(--dropdown--hover--color);
    background-color: var(--dropdown--hover--background-color);
  }

  &[aria-selected='true'] {
    color: var(--dropdown--active--color);
    background-color: var(--dropdown--active--background-color);
    cursor: initial;
  }
`

// TODO: adjust styles when use in app
const SectionSeparator = styled.li`
  border-top: 1px solid var(--input--border-color);
  margin: 0.125rem 0.3125rem; // 2px 5px;
`

const StyledList = styled(ShadowedBox)`
  overflow: auto;
  max-height: 350px;
  border: none;
  cursor: pointer;
`

const StyledListSection = styled.div`
  padding: 0.25rem 0.5rem; //4px 8px
  font-size: var(--font-size-1);
  text-transform: uppercase;
`

const StyledIconButton = styled(IconButton)`
  min-width: 1.8125rem;
`

const StyledInput = styled.input`
  background-color: inherit;
  color: inherit;
  font-size: var(--font-size-4);
  outline: none;
`

const StyledLabel = styled.label`
  font-size: var(--font-size-1);
`

const ComboBoxWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;

  @media (min-width: ${breakpoints.md}rem) {
    max-width: 492px;
    min-width: 492px;
  }
`

export default ComboBoxAddress
