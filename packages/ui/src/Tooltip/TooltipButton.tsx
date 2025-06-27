import { useIsMobile } from 'curve-ui-kit/src/hooks/useBreakpoints'
import { Tooltip } from 'curve-ui-kit/src/shared/ui/Tooltip'
import { MouseEvent, ReactNode, useCallback, useState } from 'react'
import styled from 'styled-components'
import Icon from 'ui/src/Icon'
import type { TooltipProps } from 'ui/src/Tooltip/types'
import { breakpoints } from 'ui/src/utils'

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
}: TooltipProps & {
  children?: ReactNode
  as?: string
  className?: string
  tooltip: ReactNode
  showIcon?: boolean
  customIcon?: ReactNode
  increaseZIndex?: boolean
  onClick?: () => void
  iconStyles?: IconStyles
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [scrollY, setScrollY] = useState<number | null>(null)

  const handleScroll = useCallback(() => {
    if (scrollY !== window.scrollY) {
      setOpen(false)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollY])

  const handleBtnClick = useCallback(
    (evt: MouseEvent<HTMLElement>) => {
      if (typeof onClick === 'function') onClick()

      // handle mobile click tooltip
      if (isMobile) {
        setOpen(true)
        setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
      }
    },
    [handleScroll, onClick, isMobile],
  )

  const handleClose = useCallback(() => {
    setOpen(false)
    window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const tooltipContent = (
    // @ts-ignore TODO: as error
    <StyledTooltipButton {...(as ? { as } : {})}>
      <Button className={`${className} tooltip-button`} onClick={handleBtnClick}>
        {showIcon || customIcon
          ? (customIcon ?? <StyledIcon {...iconStyles} name="InformationSquare" size={16} />)
          : children}
      </Button>
    </StyledTooltipButton>
  )

  return (
    <Tooltip
      title={props.tooltip}
      open={isMobile ? open : undefined}
      onClose={isMobile ? handleClose : undefined}
      placement={(props.placement as any) || 'top'}
      disableInteractive={!isMobile}
      arrow
      slotProps={{
        popper: {
          sx: {
            zIndex: increaseZIndex ? 2 : undefined,
            '& .MuiTooltip-tooltip': {
              maxWidth: props.minWidth || '20rem',
              textAlign: props.textAlign,
              ...(props.noWrap && { whiteSpace: 'nowrap' }),
            },
          },
        },
      }}
    >
      {tooltipContent}
    </Tooltip>
  )
}

const StyledTooltipButton = styled.span`
  position: relative;
`

const Button = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
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
