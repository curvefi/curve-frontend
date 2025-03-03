// @ts-nocheck
import { useOverlayTrigger } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import styled from 'styled-components'
import Icon from 'ui/src/Icon/Icon'
import { Popover2 } from 'ui/src/Popover2'
import { Popover2Button } from 'ui/src/Popover2'

function Popover2Trigger({ label, children, showExpandIcon = false, ...props }) {
  const ref = useRef(null)
  const state = useOverlayTriggerState(props)
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, ref)

  return (
    <>
      <Popover2Button
        buttonVariant={props.buttonVariant}
        buttonStyles={props.buttonStyles}
        {...props.buttonProps}
        {...triggerProps}
        buttonRef={ref}
        onSelectionDelete={props.onSelectionDelete}
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
          {cloneElement(children as ReactElement<PropsWithChildren>, { ...overlayProps, ...state })}
        </Popover2>
      )}
    </>
  )
}

const ButtonWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`

export default Popover2Trigger
