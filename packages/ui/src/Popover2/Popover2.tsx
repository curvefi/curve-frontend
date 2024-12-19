import { DismissButton, Overlay, usePopover } from 'react-aria'
import type { AriaPopoverProps } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'

import * as React from 'react'
import styled from 'styled-components'

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode
  portalContainer: Element
  state: OverlayTriggerState
}

function Popover2({ children, state, offset = 8, portalContainer, ...props }: PopoverProps) {
  let popoverRef = React.useRef(null)
  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      offset,
      popoverRef,
    },
    state,
  )

  return (
    <Overlay>
      <Underlay {...underlayProps} className="underlay" />
      <Popover
        {...popoverProps}
        onBlur={() => {
          // Empty function to prevent seeing "Failed to execute 'createTreeWalker' on 'Document': parameter 1 is not of type 'Node'." error message.
          // This occurs when the following popover is open and clicking on something else outside the browser view will trigger
          // this error. This error might only occur during development.
        }}
        ref={popoverRef}
        className="popover"
      >
        <DismissButton onDismiss={state.close} />
        {/* @ts-ignore */}
        {React.cloneElement(children, state)}
        <DismissButton onDismiss={state.close} />
      </Popover>
    </Overlay>
  )
}

const Underlay = styled.div`
  position: fixed;
  inset: 0;
`

const Popover = styled.div`
  background: var(--popover--background-color);
  border: 1px solid var(--popover--border-color);
  box-shadow: var(--popover--box-shadow);
`

export default Popover2
