import type { AriaTooltipProps } from 'react-aria'
import type { TooltipTriggerState } from 'react-stately'
import type { IsClosePlacement, TooltipProps } from 'ui/src/Tooltip/types'

import React, { useCallback } from 'react'
import { useTooltip, mergeProps } from 'react-aria'
import styled from 'styled-components'

const Tooltip = ({
  buttonNode,
  state,
  increaseZIndex = false,
  ...props
}: React.PropsWithChildren<
  AriaTooltipProps &
    TooltipProps & {
      buttonNode: HTMLButtonElement | null
      state: TooltipTriggerState
      increaseZIndex?: boolean
    }
>) => {
  const { tooltipProps, ...rest } = useTooltip(props, state)
  const charCount = typeof props.children === 'string' ? props.children.length : null

  const getClosePlacement = useCallback((buttonNode: HTMLButtonElement | null) => {
    let placement: IsClosePlacement = { top: false, bottom: false, left: false, right: false }

    if (buttonNode) {
      const { top, left, bottom, right } = buttonNode.getBoundingClientRect()
      const { innerHeight, innerWidth } = window

      return {
        top: top > 0 && top < 200,
        bottom: bottom > 0 && innerHeight - bottom < 200,
        left: left > 0 && left < 200,
        right: right > 0 && innerWidth - right < 200,
      }
    }
    return placement
  }, [])

  return (
    <StyledTooltip
      {...mergeProps(props, tooltipProps)}
      isClosePlacement={getClosePlacement(buttonNode)}
      charCount={charCount}
      increaseZIndex={increaseZIndex}
    >
      {props.children}
    </StyledTooltip>
  )
}

Tooltip.displayName = 'Tooltip'

const StyledTooltip = styled.span<
  TooltipProps & { charCount: number | null; isClosePlacement: IsClosePlacement; increaseZIndex: boolean }
>`
  background: var(--tooltip--background-color);
  border: 1px solid gray;
  border-radius: 2px;
  box-shadow: 0 8px 20px rgba(0 0 0 / 0.1);
  color: var(--tooltip--color);
  font-size: var(--font-size-2);
  line-height: 1.25;
  margin-top: 0.625rem; // 10px;
  max-width: 20rem; //320px;
  outline: none;
  padding: 0.5rem;
  position: absolute;
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`};
  top: 100%;
  ${({ noWrap }) => noWrap && `white-space: nowrap;`}
  z-index: ${({ increaseZIndex }) => (increaseZIndex ? '2' : 'var(--z-index-tooltip)')};

  ${({ minWidth, charCount }) => {
    if (minWidth) {
      return `min-width: ${minWidth};`
    } else if (charCount !== null && charCount > 30) {
      return `min-width: 150px;`
    }
  }}

  ${({ isClosePlacement, placement }) => {
    let resp: { [key: string]: string | number } = {}
    if (isClosePlacement.top || isClosePlacement.bottom || isClosePlacement.left || isClosePlacement.right) {
      if (isClosePlacement.bottom) {
        if (isClosePlacement.left) {
          resp = { top: 'initial', left: 0, bottom: '20px' }
        } else {
          resp = { top: 'initial', right: 0, bottom: '20px' }
        }
      } else if (isClosePlacement.left) {
        resp = { left: 0 }
      } else {
        resp = { right: 0 }
      }
    }

    if (placement) {
      if (placement === 'top end' || placement === 'top') {
        if (typeof resp['top'] === 'undefined') {
          resp.top = 'initial'
        }
        if (typeof resp['right'] === 'undefined') {
          resp.right = 0
        }
        if (typeof resp['bottom'] === 'undefined') {
          resp.bottom = '20px'
        }
        // return `top: initial; right: 0; bottom: 20px;`
      } else if (placement === 'start') {
        if (typeof resp.left === 'undefined') {
          resp.left = 0
        }
        return `left: 0;`
      }
    }
    if (Object.keys(resp).length > 0) {
      let value = ''
      Object.keys(resp).forEach((k) => {
        value += ` ${k}: ${resp[k]};`
      })
      return value
    } else {
      return `right: 0;`
    }
    // return `right: 0;`
  }};
`

export default Tooltip
