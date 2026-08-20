import { type ReactElement, type RefObject } from 'react'
import type { Theme } from '@mui/material'
import type { SxProps } from '@ui-kit/utils'

/**
 * A component that inverts the theme when hovered.
 * The child component should accept the following props
 */
type ChildProps = {
  sx: SxProps
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
   * A ref to the element that should trigger the hover effect. Used to handle the focus-visible state.
   */
  hoverRef: RefObject<HTMLLIElement | HTMLTableRowElement | null>

  /** Whether to disable the hover effect */
  disabled?: boolean
}

/**
 * A component that inverts the theme when hovered. Currently, disabled due to performance issues.
 * In the future we want to use css variables to achieve the same effect without fully changing the theme.
 */
export const InvertOnHover = ({ children }: InvertOnHoverProps) => children
