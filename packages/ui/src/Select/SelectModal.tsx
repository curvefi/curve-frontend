import { RefObject, useRef } from 'react'
import type { AriaListBoxOptions, AriaOverlayProps } from 'react-aria'
import { useOverlay, DismissButton, FocusScope, usePreventScroll } from 'react-aria'
import type { SelectState } from 'react-stately'
import { styled } from 'styled-components'
import { SelectModalListBox } from '@ui/Select/SelectModalListBox'
import { breakpoints } from '@ui/utils'

export function SelectModal<T>({
  menuProps,
  state,
  ...props
}: AriaOverlayProps & {
  menuProps: AriaListBoxOptions<T>
  minWidth?: string
  mobileRightAlign?: boolean
  popoverRef?: RefObject<HTMLDivElement | null>
  state: SelectState<T>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { mobileRightAlign, popoverRef = ref, minWidth } = props
  usePreventScroll()

  const { overlayProps } = useOverlay(
    {
      isOpen: state.isOpen,
      onClose: state.close,
      shouldCloseOnBlur: true,
      isDismissable: true,
    },
    popoverRef,
  )

  return (
    <FocusScope restoreFocus>
      <StyledPopover
        className={`select-dropdown-list ${mobileRightAlign ? 'isRightAlign' : ''}`}
        {...overlayProps}
        ref={popoverRef}
        minWidth={minWidth}
      >
        <SelectModalListBox {...menuProps} state={state} />
        <DismissButton onDismiss={state.close} />
      </StyledPopover>
    </FocusScope>
  )
}

SelectModal.displayName = 'SelectModal'

const StyledPopover = styled.div<{ minWidth?: string }>`
  background-color: lightgray;
  border: 1px solid gray;
  margin-top: 0.25rem;
  ${({ minWidth }) => minWidth && `min-width: ${minWidth}`};
  position: absolute;
  width: 100%;
  z-index: var(--z-index-page-nav-scrolled);

  &.isRightAlign {
    right: 0;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    right: auto;
  }
`
