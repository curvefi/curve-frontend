import { cloneElement, type ReactElement, type RefObject } from 'react'
import type { Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import { useClassObserver } from '@ui-kit/hooks/useClassObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { classNames, CypressHoverClass, useNativeEventInCypress } from '@ui-kit/utils/dom'

/**
 * A component that inverts the theme when hovered.
 * The child component should accept the following props
 */
type ChildProps = {
  sx: SystemStyleObject<Theme>
  onMouseEnter: () => void
  onMouseLeave: () => void
  transition: string
  className: string
}

type InvertOnHoverProps = {
  children: ReactElement<ChildProps>

  /**
   * The color to use when the element is hovered. Note that this color will be inverted when the element is hovered.
   * By default, this is the hover color from the design theme.
   */
  hoverColor?: string | ((t: Theme) => string)

  /**
   * A ref to the element that should trigger the hover effect.
   */
  hoverRef: RefObject<HTMLLIElement | HTMLTableRowElement | null>
}

const defaultHoverColor = (t: Theme) => t.design.Layer.TypeAction.Hover

export const InvertOnHover = ({ children: child, hoverRef, hoverColor = defaultHoverColor }: InvertOnHoverProps) => {
  const [isHover, onMouseEnter, onMouseLeave] = useSwitch(false)
  const inverted = useClassObserver(hoverRef, 'Mui-focusVisible') || isHover
  const childSx = (child.props.sx as Record<string, object>) ?? {}

  useNativeEventInCypress(hoverRef.current, 'mouseenter', onMouseEnter)

  return (
    <InvertTheme inverted={inverted}>
      {cloneElement(child, {
        ...child.props,
        className: classNames(inverted && CypressHoverClass, child.props?.className),
        onMouseEnter,
        onMouseLeave,
        sx: {
          ...childSx,
          color: (theme) => theme.palette.text.secondary, // by default components have color: 'inherit' which breaks the inverted theme
          transition: [`background-color ${TransitionFunction}`, childSx['transition']].filter(Boolean).join(', '),
          '&:hover': { ...childSx['&:hover'], backgroundColor: hoverColor },
          ...(inverted && { backgroundColor: hoverColor }),
        },
      })}
    </InvertTheme>
  )
}
