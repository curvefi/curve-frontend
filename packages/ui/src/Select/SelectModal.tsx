import type { AriaListBoxOptions, AriaOverlayProps } from 'react-aria'
import type { SelectState } from 'react-stately'

import * as React from 'react'
import { useOverlay, DismissButton, FocusScope, usePreventScroll } from 'react-aria'
import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils'

import SelectModalListBox from 'ui/src/Select/SelectModalListBox'

function SelectModal<T>({
  menuProps,
  state,
  selectSearchOptions,
  ...props
}: React.PropsWithChildren<
  AriaOverlayProps & {
    menuProps: AriaListBoxOptions<T>
    minWidth?: string
    mobileRightAlign?: boolean
    popoverRef?: React.RefObject<HTMLDivElement>
    selectSearchOptions?: {
      onSelectionChange: (key: React.Key) => void
      searchFilterKeys: string[]
    }
    state: SelectState<T>
  }
>) {
  const ref = React.useRef<HTMLDivElement>(null)
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

export default SelectModal
