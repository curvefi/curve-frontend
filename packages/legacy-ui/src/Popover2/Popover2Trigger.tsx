import { cloneElement, ReactElement, ReactNode, useRef } from 'react'
import { useOverlayTrigger } from 'react-aria'
import type { OverlayTriggerProps } from 'react-stately'
import { useOverlayTriggerState } from 'react-stately'
import { styled } from 'styled-components'
import { Popover2, Popover2Button } from '@legacy-ui/Popover2'
import { RotatableIcon } from '@ui/icons/RotatableIcon'
import { TriangleDown } from '@ui/icons/TriangleDown'
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
            <RotatableIcon icon={TriangleDown} rotated={!!triggerProps['aria-expanded']} fontSize={16} />
          </ButtonWrapper>
        ) : (
          label
        )}
      </Popover2Button>
      {state.isOpen && (
        <Popover2 {...props} triggerRef={ref} state={state}>
          {/* eslint-disable-next-line @eslint-react/no-clone-element -- Existing violation before enabling this rule. */}
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
