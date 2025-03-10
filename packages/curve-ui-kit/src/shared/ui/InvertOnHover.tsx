import { cloneElement, type ReactElement, type RefObject } from 'react'
import type { SxProps, Theme } from '@mui/material'
import { useClassObserver } from '@ui-kit/hooks/useClassObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

/**
 * A component that inverts the theme when hovered.
 * The child component should accept the following props
 */
type ChildProps = { sx: SxProps<Theme>; onMouseEnter: () => void; onMouseLeave: () => void; transition: string }

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
  const isFocusVisible = useClassObserver(hoverRef, 'Mui-focusVisible')

  return (
    <InvertTheme inverted={isHover || isFocusVisible}>
      {cloneElement(child, {
        ...child.props,
        onMouseEnter,
        onMouseLeave,
        transition: [`background-color ${TransitionFunction}`, child.props.transition].filter(Boolean).join(', '),
        sx: {
          color: (theme) => theme.palette.text.secondary, // by default components have color: 'inherit' which breaks the inverted theme
          ...child.props.sx,
          ...(isHover && { backgroundColor: hoverColor }),
        },
      })}
    </InvertTheme>
  )
}
