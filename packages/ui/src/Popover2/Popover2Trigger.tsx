// @ts-nocheck
import { useOverlayTrigger } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import * as React from 'react'
import styled from 'styled-components'

import Icon from 'ui/src/Icon/Icon'
import Popover2 from 'ui/src/Popover2/Popover2'
import Popover2Button from 'ui/src/Popover2/Popover2Button'

function Popover2Trigger({ label, children, showExpandIcon, onSelectionDelete, ...props }) {
  let ref = React.useRef(null)
  let state = useOverlayTriggerState(props)
  let { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, ref)

  return (
    <>
      <Popover2Button
        buttonVariant={props.buttonVariant}
        buttonStyles={props.buttonStyles}
        {...props.buttonProps}
        {...triggerProps}
        buttonRef={ref}
        onSelectionDelete={onSelectionDelete}
      >
        {showExpandIcon ? (
          <ButtonWrapper>
            {label}
            {triggerProps['aria-expanded'] ? <Icon size={16} name="CaretUp" /> : <Icon size={16} name="CaretDown" />}
          </ButtonWrapper>
        ) : (
          label
        )}
      </Popover2Button>
      {state.isOpen && (
        <Popover2 {...props} triggerRef={ref} state={state}>
          {React.cloneElement(children as React.ReactElement<React.PropsWithChildren>, { ...overlayProps, ...state })}
        </Popover2>
      )}
    </>
  )
}

Popover2Trigger.defaultProps = {
  showExpandIcon: false, // show open or close svg after label
}

const ButtonWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`

export default Popover2Trigger
