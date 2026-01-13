import { useIsMobile } from 'curve-ui-kit/src/hooks/useBreakpoints'
import { Tooltip } from 'curve-ui-kit/src/shared/ui/Tooltip'
import { ReactNode, useCallback, useState } from 'react'
import { styled } from 'styled-components'
import Icon from 'ui/src/Icon'
import type { TooltipProps } from 'ui/src/Tooltip/types'
import { breakpoints } from 'ui/src/utils'

export type IconStyles = { $svgTop?: string }

/**
 * Hook to handle mobile tooltip behavior, using click events to open the tooltip
 */
function useMobileTooltip(onClick: { (): void | undefined } | (() => void) | undefined) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [scrollY, setScrollY] = useState<number | null>(null)

  const handleScroll = useCallback(() => {
    if (scrollY !== window.scrollY) {
      setOpen(false)
      // eslint-disable-next-line react-hooks/immutability
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollY])

  return {
    isMobile,
    open,
    onClick: useCallback(() => {
      onClick?.()
      // handle mobile click tooltip
      if (isMobile) {
        setOpen(true)
        setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
      }
    }, [handleScroll, onClick, isMobile]),
    onClose: useCallback(() => {
      setOpen(false)
      window.removeEventListener('scroll', handleScroll)
    }, [handleScroll]),
  }
}

function TooltipButton({
  className = '',
  children,
  showIcon,
  customIcon,
  onClick: parentOnClick,
  increaseZIndex,
  iconStyles = {},
  as,
  tooltip,
  noWrap,
  clickable,
  textAlign,
  minWidth,
  placement = 'top',
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
  const { isMobile, open, onClick, onClose } = useMobileTooltip(parentOnClick)
  return (
    <Tooltip
      clickable={clickable}
      title={tooltip}
      key={`${isMobile}`} // force remount when switching so we don't change from controlled to uncontrolled
      {...(isMobile && { open, onClose })}
      placement={placement}
      slotProps={{
        popper: {
          sx: {
            ...(increaseZIndex && { zIndex: 2 }),
            '& .MuiTooltip-tooltip': {
              maxWidth: minWidth || '20rem',
              textAlign: textAlign,
              ...(noWrap && { whiteSpace: 'nowrap' }),
            },
          },
        },
      }}
    >
      <StyledTooltipButton {...(as ? { as } : {})}>
        <Button className={`${className} tooltip-button`} onClick={onClick}>
          {showIcon || customIcon
            ? (customIcon ?? <StyledIcon {...iconStyles} name="InformationSquare" size={16} />)
            : children}
        </Button>
      </StyledTooltipButton>
    </Tooltip>
  )
}

const StyledTooltipButton = styled.span`
  position: relative;
`

// not a button to avoid "button inside button" errors (`TheadButton` is already a button)
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
