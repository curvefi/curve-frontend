import { CSSProperties, ReactNode, RefObject, useRef } from 'react'
import type {
  AriaButtonProps,
  AriaListBoxOptions,
  AriaListBoxSectionProps,
  AriaOptionProps,
  AriaOverlayProps,
} from 'react-aria'
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
import type { ComboBoxStateOptions, ListState } from 'react-stately'
import { useComboBoxState } from 'react-stately'
import { styled } from 'styled-components'
import type { Node } from '@react-types/shared'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import InputProvider from '@ui/InputComp'
import ShadowedBox from '@ui/ShadowedBox'
import { breakpoints } from '@ui/utils/responsive'

const Popover = (props: AriaOverlayProps & { popoverRef: RefObject<HTMLDivElement | null>; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
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

function Option<T extends object>({ item, state }: AriaOptionProps & { state: ListState<T>; item: Node<T> }) {
  const ref = useRef<HTMLLIElement>(null)
  const { optionProps, isFocused } = useOption({ key: item.key }, state, ref)
  const { focusProps } = useFocusRing()

  return (
    <StyledItem {...mergeProps(optionProps, focusProps)} className={isFocused ? 'isFocused' : ''} ref={ref}>
      {item.rendered}
    </StyledItem>
  )
}

function ListBoxSection<T extends object>({
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
          {[...section.childNodes].map((node) => (
            <Option key={node.key} item={node} state={state} />
          ))}
        </ul>
      </li>
    </>
  )
}

function ListBox<T extends object>(
  props: AriaListBoxOptions<T> & { listBoxRef: RefObject<HTMLUListElement | null>; state: ListState<T> },
) {
  const ref = useRef<HTMLUListElement>(null)
  const { listBoxRef = ref, state } = props
  const { listBoxProps } = useListBox(props, state, listBoxRef)

  return (
    <StyledList as="ul" {...listBoxProps} ref={listBoxRef}>
      {[...state.collection].map((item) => (
        <ListBoxSection key={item.key} section={item} state={state} />
      ))}
    </StyledList>
  )
}

function Button(props: AriaButtonProps & { buttonRef: RefObject<HTMLButtonElement | null>; style?: CSSProperties }) {
  const { buttonRef, children, style } = props
  const { buttonProps } = useButton(props, buttonRef)
  return (
    <StyledIconButton {...buttonProps} ref={buttonRef} style={style}>
      {children}
    </StyledIconButton>
  )
}

function ComboBoxAddress<T extends object>(props: ComboBoxStateOptions<T>) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listBoxRef = useRef<HTMLUListElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

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
