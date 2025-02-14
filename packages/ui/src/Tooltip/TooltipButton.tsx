import type { TooltipProps } from 'ui/src/Tooltip/types'
import type { TooltipTriggerProps } from 'react-stately'

import React, { useCallback, useState } from 'react'
import { breakpoints, getIsMobile } from 'ui/src/utils'
import { useTooltipTriggerState } from 'react-stately'
import { useTooltipTrigger } from 'react-aria'
import styled from 'styled-components'

import Icon from 'ui/src/Icon'
import Tooltip from 'ui/src/Tooltip/Tooltip'

export type IconStyles = { $svgTop?: string }

function TooltipButton({
  className = '',
  children,
  showIcon,
  customIcon,
  onClick,
  increaseZIndex,
  iconStyles = {},
  as,
  ...props
}: React.PropsWithChildren<
  TooltipTriggerProps &
    TooltipProps & {
      as?: string
      className?: string
      tooltip: React.ReactNode | string
      showIcon?: boolean
      customIcon?: React.ReactNode
      increaseZIndex?: boolean
      onClick?: () => void
      iconStyles?: IconStyles
    }
>) {
  const state = useTooltipTriggerState({ delay: 0, ...props })
  const ref = React.useRef<HTMLButtonElement | null>(null)
  const { triggerProps, tooltipProps } = useTooltipTrigger(props, state, ref)

  const [scrollY, setScrollY] = useState<number | null>(null)

  const handleScroll = useCallback(() => {
    if (scrollY !== window.scrollY) {
      state.close()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollY, state])

  const handleBtnClick = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement>) => {
      if (typeof triggerProps.onClick === 'function') triggerProps.onClick(evt)
      if (typeof onClick === 'function') onClick()

      // handle mobile click tooltip
      if (getIsMobile()) {
        state.open()
        setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
      }
    },
    [handleScroll, onClick, state, triggerProps],
  )

  return (
    // @ts-ignore TODO: as error
    <StyledTooltipButton {...(as ? { as } : {})}>
      <Button ref={ref} {...triggerProps} className={`${className} tooltip-button`} onClick={handleBtnClick}>
        {showIcon || customIcon
          ? (customIcon ?? <StyledIcon {...iconStyles} name="InformationSquare" size={16} />)
          : children}
      </Button>
      {state.isOpen && (
        <Tooltip state={state} buttonNode={ref?.current} {...props} {...tooltipProps} increaseZIndex={increaseZIndex}>
          {props.tooltip}
        </Tooltip>
      )}
    </StyledTooltipButton>
  )
}

const StyledTooltipButton = styled.span`
  position: relative;
`

const Button = styled.span`
  align-items: center;
  background-color: transparent;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  font-size: inherit;
  justify-content: center;
  min-height: var(--height-small);
  min-width: var(--height-small);

  @media (min-width: ${breakpoints.sm}rem) {
    min-height: 16px;
    min-width: 16px;
  }

  > svg {
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }
`

const StyledIcon = styled(Icon)<IconStyles>`
  position: relative;
  top: ${({ $svgTop }) => $svgTop || `0.2rem`};
`

export default TooltipButton
