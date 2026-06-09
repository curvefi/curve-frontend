/* eslint-disable @typescript-eslint/consistent-type-definitions */
/**
 * Override the types of the `Select` and `ListBox` components to add the `children` prop.
 * This is for backwards compatibility with the existing components that are currently passing the children prop.
 *
 * --- Some background
 * They changed they API like e.g.: `AriaSelectOptions<T> = Omit<AriaSelectProps<T>, 'children'>`
 * Their source code, however, always passes all given props back to the caller (at this moment).
 * The components seem to work fine, but the types are broken.
 *
 * TODO Refactor components to render their own children, or replace with MUI
 */
import type { ReactNode } from 'react'
import type { SelectionMode } from 'react-stately'

declare module 'react-stately' {
  export interface SelectStateOptions<T, _M extends SelectionMode = 'single'> {
    children?: ReactNode | ((item: T) => ReactNode)
  }
}

declare module 'react-aria' {
  export interface AriaSelectOptions<T, _M extends SelectionMode = 'single'> {
    children?: ReactNode | ((item: T) => ReactNode)
  }
  export interface AriaListBoxOptions<T> {
    children?: ReactNode | ((item: T) => ReactNode)
  }
}
