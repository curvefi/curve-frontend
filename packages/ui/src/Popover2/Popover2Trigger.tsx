import { cloneElement, ReactElement, ReactNode, useRef } from 'react'
import { useOverlayTrigger } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import { styled } from 'styled-components'
import { OverlayTriggerProps } from '@react-types/overlays'
import { Icon } from '@ui/Icon/Icon'
import { Popover2, Popover2Button } from '@ui/Popover2'
import { PopoverProps } from './Popover2'
import { Popover2ButtonProps } from './Popover2Button'
import { DialogProps } from './Popover2Dialog'

type Props = Partial<PopoverProps> &
  OverlayTriggerProps &
  Pick<Popover2ButtonProps, 'buttonVariant' | 'buttonStyles' | 'onSelectionDelete'> & {
    label: ReactNode
    showExpandIcon?: boolean
    buttonProps?: Partial<Popover2ButtonProps>
    children: ReactElement<DialogProps>
  }

export function Popover2Trigger({ label, children, showExpandIcon = false, ...props }: Props) {
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
          {cloneElement(children, { ...overlayProps, ...state })}
        </Popover2>
      )}
    </>
  )
}

const ButtonWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`
