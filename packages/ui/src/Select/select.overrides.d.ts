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
declare module '@react-types/select' {
  import {
    AriaListBoxOptions as OriginalListBoxOptions,
    AriaSelectOptions as OriginalSelectOptions,
    SelectProps as OriginalSelectProps,
    SelectStateOptions as OriginalSelectStateOptions,
  } from '@react-types/select'

  type FieldsToAdd = Pick<OriginalSelectProps, 'children'>
  export type SelectStateOptions<T> = {} & OriginalSelectStateOptions<T> & FieldsToAdd
  export type AriaSelectOptions<T> = {} & OriginalSelectOptions<T> & FieldsToAdd
  export type AriaListBoxOptions<T> = {} & OriginalListBoxOptions<T> & FieldsToAdd
}
