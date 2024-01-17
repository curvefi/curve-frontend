import type { AriaDialogProps, AriaPopoverProps } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'
import type { TooltipProps } from 'ui/src/Tooltip/types'

import React from 'react'
import { DismissButton, Overlay, useButton, useDialog, usePopover, useOverlayTrigger } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import debounce from 'lodash/debounce'
import styled from 'styled-components'

import { breakpoints, getIsMobile } from 'ui/src/utils'

import Icon from 'ui/src/Icon/Icon'

const Tooltip = ({
  children,
  isCloseOnTooltipOnly,
  showIcon,
  customIcon,
  tooltip,
  ...props
}: React.PropsWithChildren<
  TooltipProps & {
    isCloseOnTooltipOnly?: boolean
    showIcon?: boolean
    customIcon?: React.ReactNode
    tooltip: React.ReactNode | string | null
  }
>) => {
  // @ts-ignore
  const state = useOverlayTriggerState(props)
  const ref = React.useRef<HTMLButtonElement>(null)
  const { triggerProps, overlayProps } = useOverlayTrigger({ type: 'dialog' }, state, ref)
  const isMobile = getIsMobile()

  return (
    <>
      <TooltipAction
        {...triggerProps}
        isCloseOnTooltipOnly={isCloseOnTooltipOnly}
        isMobile={isMobile}
        state={state}
        buttonRef={ref}
      >
        {showIcon || customIcon
          ? customIcon ?? <TooltipIcon className="svg-tooltip" name="InformationSquare" size={16} />
          : children}
      </TooltipAction>
      {state.isOpen && (
        <Popover
          {...props}
          isCloseOnTooltipOnly={isCloseOnTooltipOnly}
          isMobile={isMobile}
          triggerRef={ref}
          state={state}
        >
          {React.cloneElement(<Dialog {...props}>{tooltip}</Dialog>, overlayProps)}
        </Popover>
      )}
    </>
  )
}

const TooltipIcon = styled(Icon)`
  position: relative;
  top: 0.25rem; // 4px
  opacity: 0.4;

  :hover {
    opacity: 1;
  }
`

function Popover({
  children,
  isCloseOnTooltipOnly,
  isMobile,
  offset = 12,
  state,
  ...props
}: React.PropsWithChildren<
  Omit<AriaPopoverProps, 'popoverRef'> & {
    children: React.ReactNode
    isCloseOnTooltipOnly?: boolean
    isMobile: boolean
    state: OverlayTriggerState
  }
>) {
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const { popoverProps, underlayProps, arrowProps, placement } = usePopover({ ...props, offset, popoverRef }, state)

  return (
    <Overlay>
      {(isCloseOnTooltipOnly || isMobile) && <PopoverUnderlay {...underlayProps} />}
      <PopoverWrapper {...popoverProps} ref={popoverRef}>
        <PopoverArrow {...arrowProps} className="arrow" data-placement={placement}>
          <path d="M0 0,L6 6,L12 0" />
        </PopoverArrow>
        <DismissButton onDismiss={state.close} />
        {children}
        <DismissButton onDismiss={state.close} />
      </PopoverWrapper>
    </Overlay>
  )
}

const PopoverUnderlay = styled.div`
  position: fixed;
  inset: 0;
`

const PopoverWrapper = styled.div`
  color: var(--tooltip--background-color);
  background: var(--tooltip--background-color);
  box-shadow: 0 8px 20px rgba(0 0 0 / 0.1);
  border-radius: 2px;

  font-size: var(--font-size-2);
  line-height: 1.25;
`

const PopoverArrow = styled.svg`
  position: absolute;
  width: 0.75rem; //12px
  height: 0.75rem; //12px
  border: solid 5px transparent;
  border-top-color: currentColor;

  &[data-placement='top'] {
    top: 100%;
    transform: translateX(-50%);
  }

  &[data-placement='bottom'] {
    bottom: 100%;
    transform: translateX(-50%) rotate(180deg);
  }

  &[data-placement='left'] {
    left: 100%;
    transform: translateY(-50%) rotate(-90deg);
  }

  &[data-placement='right'] {
    right: 100%;
    transform: translateY(-50%) rotate(90deg);
  }
`

function TooltipAction({
  isCloseOnTooltipOnly,
  isMobile,
  state,
  ...props
}: React.PropsWithChildren<{
  isCloseOnTooltipOnly?: boolean
  isMobile: boolean
  buttonRef: React.RefObject<HTMLButtonElement>
  state: OverlayTriggerState
}>) {
  const ref = props.buttonRef
  const { buttonProps } = useButton(props, ref)

  return (
    <span
      {...buttonProps}
      {...(!isMobile
        ? {
            onMouseOver: () => {
              if (!state.isOpen) {
                state.setOpen(true)
              }
            },
            onMouseOut: isCloseOnTooltipOnly
              ? debounce(() => {
                  if (state.isOpen) {
                    state.setOpen(false)
                  }
                }, 3000)
              : () => {
                  if (state.isOpen) {
                    state.setOpen(false)
                  }
                },
          }
        : {})}
      ref={ref}
    >
      {props.children}
    </span>
  )
}

interface DialogProps extends AriaDialogProps {
  title?: React.ReactNode
  children: React.ReactNode
}

function Dialog({ title, children, ...props }: DialogProps) {
  let ref = React.useRef(null)
  let { dialogProps } = useDialog(props, ref)

  return (
    <DialogWrapper {...props} {...dialogProps} ref={ref}>
      {children}
    </DialogWrapper>
  )
}

const DialogWrapper = styled.div<{ minWidth?: string; noWrap?: boolean; textAlign?: string }>`
  padding: 0.5rem;
  outline: none;
  color: var(--tooltip--color);

  ${({ noWrap }) => {
    if (!noWrap) {
      return `max-width: 12.5rem;`
    }
  }};

  ${({ textAlign }) => {
    if (textAlign) {
      return `text-align: ${textAlign};`
    }
  }};

  @media (min-width: ${breakpoints.md}rem) {
    ${({ noWrap, minWidth, textAlign }) => {
      if (!noWrap) {
        return `
          max-width: ${minWidth ?? '12.5rem'}; // 200px
        `
      }

      if (textAlign) {
        return `
          text-align: ${textAlign};
        `
      }
    }};
  }
`

export default Tooltip
