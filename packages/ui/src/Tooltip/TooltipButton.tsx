import type { TooltipProps } from 'ui/src/Tooltip/types'
import type { TooltipTriggerProps } from 'react-stately'

import React, { useCallback, useState } from 'react'
import { getIsMobile } from 'ui/src/utils'
import { useTooltipTriggerState } from 'react-stately'
import { useTooltipTrigger } from 'react-aria'
import styled from 'styled-components'

import Icon from 'ui/src/Icon'
import Tooltip from 'ui/src/Tooltip/Tooltip'

export type IconStyles = { $svgTop?: string }

function TooltipButton({
  children,
  className = '',
  showIcon,
  customIcon,
  iconStyles = {},
  ...props
}: React.PropsWithChildren<
  TooltipTriggerProps &
    TooltipProps & {
      className?: string
      tooltip: React.ReactNode | string
      showIcon?: boolean
      customIcon?: React.ReactNode
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

      // handle mobile click tooltip
      if (getIsMobile()) {
        state.open()
        setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
      }
    },
    [handleScroll, state, triggerProps]
  )

  return (
    <StyledTooltipButton className={className}>
      <Button ref={ref} {...triggerProps} onClick={handleBtnClick}>
        {showIcon || customIcon
          ? customIcon ?? <StyledIcon {...iconStyles} name="InformationSquare" size={16} />
          : children}
      </Button>
      {state.isOpen && (
        <Tooltip state={state} buttonNode={ref?.current} {...props} {...tooltipProps}>
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
  background-color: transparent;
  color: inherit;
  font-size: inherit;

  > svg {
    position: relative;
    top: 2px;
    opacity: 0.4;

    :hover {
      opacity: 1;
    }
  }
`

const StyledIcon = styled(Icon)<IconStyles>`
  position: relative;
  top: ${({ $svgTop }) => $svgTop || `0.2rem`};
`

export default TooltipButton
